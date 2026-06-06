//! Repo-local AgentReady persistence under `.agentready/`.
//!
//! The Tauri layer owns persistence; the Java engine stays stateless. This module
//! reads and writes structured JSON for the current session and current feature spec.

use std::fs;
use std::path::{Path, PathBuf};

use chrono::{SecondsFormat, Utc};
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};

use crate::models::FeatureSpec;

const SCHEMA_VERSION: &str = "1.0";
const FEATURE_SPEC_REL: &str = ".agentready/feature-spec.json";

/// Mirrors docs/schemas/current-session.schema.json.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct CurrentSession {
    pub schema_version: String,
    pub repo_path: String,
    pub repo_name: Option<String>,
    pub opened_at: String,
    pub last_accessed_at: String,
    pub last_readiness_run_at: Option<String>,
    pub latest_report_path: Option<String>,
    pub latest_report_verdict: Option<String>,
    pub active_feature_spec_id: Option<String>,
    pub feature_spec_path: String,
    pub report_history_count: i64,
    pub app_version: Option<String>,
}

impl Default for CurrentSession {
    fn default() -> Self {
        CurrentSession {
            schema_version: SCHEMA_VERSION.to_string(),
            repo_path: String::new(),
            repo_name: None,
            opened_at: String::new(),
            last_accessed_at: String::new(),
            last_readiness_run_at: None,
            latest_report_path: None,
            latest_report_verdict: None,
            active_feature_spec_id: None,
            feature_spec_path: FEATURE_SPEC_REL.to_string(),
            report_history_count: 0,
            app_version: None,
        }
    }
}

/// Combined repo-local state returned to the UI.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RepoSessionState {
    pub session: CurrentSession,
    pub feature_spec: Option<FeatureSpec>,
}

/// Create `.agentready/` storage if missing and load any existing feature spec.
pub fn init(repo_path: &str) -> Result<RepoSessionState, String> {
    let repo = validated_repo(repo_path)?;
    ensure_dirs(&repo)?;
    let session = load_or_create_session(&repo)?;
    let feature_spec = read_json::<FeatureSpec>(&feature_spec_path(&repo))?;
    Ok(RepoSessionState {
        session,
        feature_spec,
    })
}

/// Persist the current feature spec and update session pointers.
pub fn save_feature_session(repo_path: &str, spec: FeatureSpec) -> Result<RepoSessionState, String> {
    let repo = validated_repo(repo_path)?;
    ensure_dirs(&repo)?;

    write_json(&feature_spec_path(&repo), &spec)?;

    let mut session = load_or_create_session(&repo)?;
    session.active_feature_spec_id = Some(spec.id.clone());
    session.feature_spec_path = FEATURE_SPEC_REL.to_string();
    session.last_accessed_at = now();
    write_json(&session_path(&repo), &session)?;

    Ok(RepoSessionState {
        session,
        feature_spec: Some(spec),
    })
}

/// Load the current session and feature spec, if storage has been initialized.
pub fn load(repo_path: &str) -> Result<Option<RepoSessionState>, String> {
    let repo = validated_repo(repo_path)?;
    match read_json::<CurrentSession>(&session_path(&repo))? {
        None => Ok(None),
        Some(session) => {
            let feature_spec = read_json::<FeatureSpec>(&feature_spec_path(&repo))?;
            Ok(Some(RepoSessionState {
                session,
                feature_spec,
            }))
        }
    }
}

/// Record the outcome of a readiness run into session metadata (no report history yet).
pub fn record_readiness_run(repo_path: &str, verdict: String) -> Result<CurrentSession, String> {
    let repo = validated_repo(repo_path)?;
    ensure_dirs(&repo)?;

    let mut session = load_or_create_session(&repo)?;
    let timestamp = now();
    session.last_readiness_run_at = Some(timestamp.clone());
    session.latest_report_verdict = Some(verdict);
    session.last_accessed_at = timestamp;
    write_json(&session_path(&repo), &session)?;

    Ok(session)
}

fn load_or_create_session(repo: &Path) -> Result<CurrentSession, String> {
    let path = session_path(repo);
    let now = now();

    let mut session = match read_json::<CurrentSession>(&path)? {
        Some(mut existing) => {
            existing.last_accessed_at = now;
            existing
        }
        None => CurrentSession {
            schema_version: SCHEMA_VERSION.to_string(),
            repo_path: repo.to_string_lossy().into_owned(),
            repo_name: repo_name(repo),
            opened_at: now.clone(),
            last_accessed_at: now,
            feature_spec_path: FEATURE_SPEC_REL.to_string(),
            ..CurrentSession::default()
        },
    };

    session.repo_path = repo.to_string_lossy().into_owned();
    if session.repo_name.is_none() {
        session.repo_name = repo_name(repo);
    }
    session.report_history_count = count_reports(repo);
    session.app_version = Some(app_version());

    write_json(&path, &session)?;
    Ok(session)
}

fn validated_repo(repo_path: &str) -> Result<PathBuf, String> {
    let trimmed = repo_path.trim();
    if trimmed.is_empty() {
        return Err("repoPath is required".to_string());
    }
    let repo = PathBuf::from(trimmed);
    if !repo.exists() {
        return Err(format!("Repository path does not exist: {}", repo.display()));
    }
    if !repo.is_dir() {
        return Err(format!(
            "Repository path is not a directory: {}",
            repo.display()
        ));
    }
    if !repo.join(".git").exists() {
        return Err(format!(
            "Repository path is not a git repository: {}",
            repo.display()
        ));
    }
    Ok(repo)
}

fn ensure_dirs(repo: &Path) -> Result<(), String> {
    let agentready = agentready_dir(repo);
    let reports = agentready.join("reports");
    let cache = agentready.join("cache");

    for dir in [&agentready, &reports, &cache] {
        fs::create_dir_all(dir)
            .map_err(|error| format!("Failed to create {}: {error}", dir.display()))?;
    }

    let gitkeep = cache.join(".gitkeep");
    if !gitkeep.exists() {
        fs::write(&gitkeep, b"")
            .map_err(|error| format!("Failed to write {}: {error}", gitkeep.display()))?;
    }

    Ok(())
}

fn agentready_dir(repo: &Path) -> PathBuf {
    repo.join(".agentready")
}

fn session_path(repo: &Path) -> PathBuf {
    agentready_dir(repo).join("session.json")
}

fn feature_spec_path(repo: &Path) -> PathBuf {
    agentready_dir(repo).join("feature-spec.json")
}

fn repo_name(repo: &Path) -> Option<String> {
    repo.file_name()
        .and_then(|name| name.to_str())
        .map(|name| name.to_string())
}

fn count_reports(repo: &Path) -> i64 {
    let reports = agentready_dir(repo).join("reports");
    match fs::read_dir(&reports) {
        Ok(entries) => entries
            .filter_map(Result::ok)
            .filter(|entry| {
                entry
                    .path()
                    .extension()
                    .map(|ext| ext == "json")
                    .unwrap_or(false)
            })
            .count() as i64,
        Err(_) => 0,
    }
}

fn now() -> String {
    Utc::now().to_rfc3339_opts(SecondsFormat::Secs, true)
}

fn app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

fn read_json<T: DeserializeOwned>(path: &Path) -> Result<Option<T>, String> {
    if !path.exists() {
        return Ok(None);
    }
    let data = fs::read_to_string(path)
        .map_err(|error| format!("Failed to read {}: {error}", path.display()))?;
    let value = serde_json::from_str::<T>(&data)
        .map_err(|error| format!("Failed to parse {}: {error}", path.display()))?;
    Ok(Some(value))
}

fn write_json<T: Serialize>(path: &Path, value: &T) -> Result<(), String> {
    let json = serde_json::to_string_pretty(value)
        .map_err(|error| format!("Failed to serialize {}: {error}", path.display()))?;
    let tmp = path.with_extension("json.tmp");
    fs::write(&tmp, json.as_bytes())
        .map_err(|error| format!("Failed to write {}: {error}", tmp.display()))?;
    fs::rename(&tmp, path)
        .map_err(|error| format!("Failed to finalize {}: {error}", path.display()))?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    fn temp_repo(label: &str) -> PathBuf {
        let dir = env::temp_dir().join(format!("agentready-test-{label}-{}", std::process::id()));
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        dir
    }

    fn temp_git_repo(label: &str) -> PathBuf {
        let dir = temp_repo(label);
        fs::create_dir_all(dir.join(".git")).unwrap();
        dir
    }

    fn sample_spec() -> FeatureSpec {
        FeatureSpec {
            schema_version: "1.0".to_string(),
            id: "0b11d4e5-2b3f-4f7f-8b14-3f7d8f4b8e1f".to_string(),
            title: "Return 404 for missing users".to_string(),
            original_feature_description: "API should return 404 when user id not found"
                .to_string(),
            expected_keywords: vec!["user".to_string(), "404".to_string()],
            expected_status_codes: vec![404],
            risk_keywords: vec![],
            created_at: "2026-06-06T16:00:00Z".to_string(),
            updated_at: "2026-06-06T16:00:00Z".to_string(),
        }
    }

    #[test]
    fn init_creates_storage_and_session() {
        let repo = temp_git_repo("init");
        let state = init(repo.to_str().unwrap()).unwrap();

        assert!(repo.join(".agentready/session.json").exists());
        assert!(repo.join(".agentready/cache/.gitkeep").exists());
        assert_eq!(state.session.schema_version, "1.0");
        assert!(state.feature_spec.is_none());

        fs::remove_dir_all(&repo).unwrap();
    }

    #[test]
    fn save_then_load_round_trips_feature_spec() {
        let repo = temp_git_repo("save");
        let repo_str = repo.to_str().unwrap();

        save_feature_session(repo_str, sample_spec()).unwrap();
        let loaded = load(repo_str).unwrap().unwrap();

        assert_eq!(
            loaded.session.active_feature_spec_id.as_deref(),
            Some("0b11d4e5-2b3f-4f7f-8b14-3f7d8f4b8e1f")
        );
        assert_eq!(
            loaded.feature_spec.unwrap().title,
            "Return 404 for missing users"
        );

        fs::remove_dir_all(&repo).unwrap();
    }

    #[test]
    fn load_returns_none_when_uninitialized() {
        let repo = temp_git_repo("empty");
        assert!(load(repo.to_str().unwrap()).unwrap().is_none());
        fs::remove_dir_all(&repo).unwrap();
    }

    #[test]
    fn record_readiness_run_updates_verdict() {
        let repo = temp_git_repo("verdict");
        let repo_str = repo.to_str().unwrap();
        init(repo_str).unwrap();

        let session = record_readiness_run(repo_str, "NEEDS_REVIEW".to_string()).unwrap();
        assert_eq!(session.latest_report_verdict.as_deref(), Some("NEEDS_REVIEW"));
        assert!(session.last_readiness_run_at.is_some());

        fs::remove_dir_all(&repo).unwrap();
    }

    #[test]
    fn init_rejects_non_git_directory() {
        let repo = temp_repo("nongit");
        let error = init(repo.to_str().unwrap()).unwrap_err();

        assert!(error.contains("not a git repository"));

        fs::remove_dir_all(&repo).unwrap();
    }
}
