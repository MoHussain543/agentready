mod engine;
mod models;
mod storage;

use models::{EngineRequest, FeatureSpec, ReadinessReport};
use storage::{CurrentSession, ReportHistoryEntry, RepoSessionState};

#[tauri::command]
fn run_readiness(request: EngineRequest) -> Result<ReadinessReport, String> {
    engine::run_readiness(request)
}

#[tauri::command]
fn init_repo_storage(repo_path: String) -> Result<RepoSessionState, String> {
    storage::init(&repo_path)
}

#[tauri::command]
fn save_feature_session(
    repo_path: String,
    feature_spec: FeatureSpec,
) -> Result<RepoSessionState, String> {
    storage::save_feature_session(&repo_path, feature_spec)
}

#[tauri::command]
fn load_repo_session(repo_path: String) -> Result<Option<RepoSessionState>, String> {
    storage::load(&repo_path)
}

#[tauri::command]
fn set_test_command(
    repo_path: String,
    command: Option<String>,
) -> Result<CurrentSession, String> {
    storage::set_test_command(&repo_path, command)
}

#[tauri::command]
fn save_report(repo_path: String, report: ReadinessReport) -> Result<CurrentSession, String> {
    storage::save_report(&repo_path, report)
}

#[tauri::command]
fn load_latest_report(repo_path: String) -> Result<Option<ReadinessReport>, String> {
    storage::load_latest_report(&repo_path)
}

#[tauri::command]
fn list_reports(repo_path: String) -> Result<Vec<ReportHistoryEntry>, String> {
    storage::list_reports(&repo_path)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            run_readiness,
            init_repo_storage,
            save_feature_session,
            load_repo_session,
            set_test_command,
            save_report,
            load_latest_report,
            list_reports
        ])
        .run(tauri::generate_context!())
        .expect("error while running AgentReady desktop");
}
