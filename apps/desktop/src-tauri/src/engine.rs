use std::env;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use crate::models::{EngineError, EngineRequest, EngineResponse, ReadinessReport};

const DEFAULT_CHECK_SUITE: &str = "free-v1-precommit";

pub fn run_readiness(request: EngineRequest) -> Result<ReadinessReport, String> {
    validate_request(&request)?;

    let response = invoke_engine(&request)?;
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

fn invoke_engine(request: &EngineRequest) -> Result<EngineResponse, String> {
    let jar_path = resolve_engine_jar()?;
    let java_bin = resolve_java_binary()?;

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

pub fn resolve_engine_jar() -> Result<PathBuf, String> {
    if let Ok(path) = env::var("AGENTREADY_ENGINE_JAR") {
        let jar = PathBuf::from(&path);
        return ensure_jar_exists(&jar, "AGENTREADY_ENGINE_JAR");
    }

    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let candidates = [
        manifest_dir.join("../../../engine/target/agentready-engine.jar"),
        manifest_dir.join("../../resources/agentready-engine.jar"),
        manifest_dir.join("resources/agentready-engine.jar"),
    ];

    for candidate in candidates {
        if candidate.exists() {
            return Ok(candidate);
        }
    }

    Err(format!(
        "Could not locate agentready-engine.jar. Build it with `cd engine && mvn package`, \
         or set AGENTREADY_ENGINE_JAR. Checked: {}",
        candidates
            .iter()
            .map(|path| path.display().to_string())
            .collect::<Vec<_>>()
            .join(", ")
    ))
}

fn resolve_java_binary() -> Result<String, String> {
    if let Ok(path) = env::var("AGENTREADY_JAVA") {
        return Ok(path);
    }
    Ok("java".to_string())
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
            }),
        };

        assert!(validate_request(&request).is_err());
    }
}
