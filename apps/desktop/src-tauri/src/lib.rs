// Tauri commands map to docs/architecture.md. Implementations are deferred.

#[tauri::command]
fn open_repo(path: String) -> Result<String, String> {
    Err(format!("open_repo not implemented: {path}"))
}

#[tauri::command]
fn run_readiness(path: String) -> Result<String, String> {
    Err(format!("run_readiness not implemented: {path}"))
}

#[tauri::command]
fn get_session(path: String) -> Result<String, String> {
    Err(format!("get_session not implemented: {path}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![open_repo, run_readiness, get_session])
        .run(tauri::generate_context!())
        .expect("error while running AgentReady desktop");
}
