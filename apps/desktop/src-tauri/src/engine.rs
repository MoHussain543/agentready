use std::env;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use tauri::Manager;

use crate::models::{EngineError, EngineRequest, EngineResponse, ReadinessReport};

#[cfg(test)]
const DEFAULT_CHECK_SUITE: &str = "free-v1-precommit";

pub fn run_readiness(app: &tauri::AppHandle, request: EngineRequest) -> Result<ReadinessReport, String> {
    validate_request(&request)?;

    let response = invoke_engine(app, &request)?;
    if response.status == "ok" {
        response.report.ok_or_else(|| {
            "Engine returned ok but no report was present in the response".to_string()
        })
    } else {
        let error = response.error.unwrap_or(EngineError {
            code: "INTERNAL".to_string(),
            message: "Engine returned error status without details".to_string(),
        });
        Err(format!("{}: {}", error.code, error.message))
    }
}

fn validate_request(request: &EngineRequest) -> Result<(), String> {
    if request.protocol_version != "1.0" {
        return Err(format!(
            "Unsupported protocolVersion: {}",
            request.protocol_version
        ));
    }
    if request.command != "run_readiness" {
        return Err(format!("Unsupported command: {}", request.command));
    }
    if request.repo_path.trim().is_empty() {
        return Err("repoPath is required".to_string());
    }
    Ok(())
}

fn invoke_engine(app: &tauri::AppHandle, request: &EngineRequest) -> Result<EngineResponse, String> {
    let jar_path = resolve_engine_jar(app)?;
    let java_bin = resolve_java_binary(app);

    let mut child = Command::new(&java_bin)
        .arg("-jar")
        .arg(&jar_path)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|error| format!("Failed to start Java engine ({java_bin}): {error}"))?;

    let request_json = serde_json::to_string(request)
        .map_err(|error| format!("Failed to serialize engine request: {error}"))?;

    if let Some(mut stdin) = child.stdin.take() {
        stdin
            .write_all(request_json.as_bytes())
            .map_err(|error| format!("Failed to write engine request to stdin: {error}"))?;
    }

    let output = child
        .wait_with_output()
        .map_err(|error| format!("Failed while waiting for Java engine: {error}"))?;

    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();

    if stdout.is_empty() {
        return Err(format!(
            "Engine produced no stdout (exit code {:?}). stderr: {}",
            output.status.code(),
            if stderr.is_empty() {
                "(empty)".to_string()
            } else {
                stderr
            }
        ));
    }

    serde_json::from_str::<EngineResponse>(&stdout).map_err(|error| {
        format!("Failed to parse engine response JSON: {error}. stdout: {stdout}")
    })
}

pub fn resolve_engine_jar(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    // 1. Explicit override — useful for CI and custom installs.
    if let Ok(path) = env::var("AGENTREADY_ENGINE_JAR") {
        return ensure_jar_exists(&PathBuf::from(&path), "AGENTREADY_ENGINE_JAR");
    }

    let dev_jar = dev_engine_jar_path();

    // 2. In `tauri dev`, prefer the live engine build output so desktop runs
    // the latest engine code instead of a previously staged resource copy.
    if cfg!(debug_assertions) && dev_jar.exists() {
        return Ok(dev_jar);
    }

    // 3. Tauri resource dir — the canonical location in a packaged build.
    //    The JAR is declared as a bundle resource in tauri.conf.json and staged
    //    into src-tauri/resources/ as part of the release build step.
    if let Ok(resource_dir) = app.path().resource_dir() {
        let bundled = resource_dir.join("agentready-engine.jar");
        if bundled.exists() {
            return Ok(bundled);
        }
    }

    // 4. Source-tree dev fallback — works when `tauri dev` is run from the
    //    monorepo checkout. CARGO_MANIFEST_DIR is baked in at compile time and
    //    will not resolve on other machines, so this is dev-only.
    if dev_jar.exists() {
        return Ok(dev_jar);
    }

    Err(
        "Could not locate agentready-engine.jar. \
         For a release build, run `cd engine && mvn package` then stage the JAR into \
         apps/desktop/src-tauri/resources/ before running `tauri build`. \
         For local dev, run `cd engine && mvn package`. \
         Set AGENTREADY_ENGINE_JAR to override the path."
            .to_string(),
    )
}

fn dev_engine_jar_path() -> PathBuf {
    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    manifest_dir.join("../../../engine/target/agentready-engine.jar")
}

fn resolve_java_binary(app: &tauri::AppHandle) -> String {
    if let Some(path) = crate::settings::java_binary_override(app) {
        return path;
    }

    if let Ok(path) = env::var("AGENTREADY_JAVA") {
        return path;
    }

    // $JAVA_HOME is set by most JDK installers and is reliable across package managers.
    if let Ok(java_home) = env::var("JAVA_HOME") {
        let java = PathBuf::from(java_home).join("bin").join("java");
        if java.exists() {
            return java.to_string_lossy().into_owned();
        }
    }

    // When the app is launched from Finder, PATH is the minimal launchd PATH and
    // does not include Homebrew or JDK installer locations. Check known paths
    // so the engine can start without requiring AGENTREADY_JAVA to be set.
    #[cfg(target_os = "macos")]
    {
        let well_known = [
            "/opt/homebrew/opt/openjdk/bin/java", // Apple Silicon Homebrew
            "/usr/local/opt/openjdk/bin/java",     // Intel Homebrew
            "/usr/bin/java",                        // macOS system Java shim (triggers install prompt)
        ];
        for path in &well_known {
            if Path::new(path).exists() {
                return (*path).to_string();
            }
        }

        // Search JDK installations in the standard macOS location.
        if let Ok(entries) = std::fs::read_dir("/Library/Java/JavaVirtualMachines") {
            let mut found: Vec<PathBuf> = entries
                .filter_map(|e| e.ok())
                .map(|e| e.path().join("Contents/Home/bin/java"))
                .filter(|p| p.exists())
                .collect();
            found.sort();
            if let Some(java) = found.last() {
                return java.to_string_lossy().into_owned();
            }
        }
    }

    // Final fallback: rely on PATH. Works when launched from a terminal.
    "java".to_string()
}

fn ensure_jar_exists(path: &Path, label: &str) -> Result<PathBuf, String> {
    if path.exists() {
        Ok(path.to_path_buf())
    } else {
        Err(format!("{label} points to a missing file: {}", path.display()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::EngineOptions;

    #[test]
    fn validate_request_rejects_blank_repo_path() {
        let request = EngineRequest {
            protocol_version: "1.0".to_string(),
            command: "run_readiness".to_string(),
            repo_path: "   ".to_string(),
            feature_spec: None,
            options: Some(EngineOptions {
                check_suite: Some(DEFAULT_CHECK_SUITE.to_string()),
                large_diff_max_lines: None,
                large_diff_max_files: None,
                include_staged: Some(true),
                include_unstaged: Some(true),
                run_tests: Some(false),
                test_command: None,
                test_command_cwd: None,
            }),
        };

        assert!(validate_request(&request).is_err());
    }
}
