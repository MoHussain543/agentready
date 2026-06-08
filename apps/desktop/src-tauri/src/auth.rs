use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::Manager;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
struct AuthFile {
    user_token: Option<String>,
}

pub fn load_token(app: &tauri::AppHandle) -> Option<String> {
    read_auth_file(app).ok().and_then(|a| a.user_token)
}

pub fn save_token(app: &tauri::AppHandle, token: String) -> Result<(), String> {
    write_auth_file(app, &AuthFile { user_token: Some(token) })
}

pub fn clear_token(app: &tauri::AppHandle) -> Result<(), String> {
    write_auth_file(app, &AuthFile { user_token: None })
}

fn read_auth_file(app: &tauri::AppHandle) -> Result<AuthFile, String> {
    let path = auth_path(app)?;
    if !path.exists() {
        return Ok(AuthFile::default());
    }
    let data = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read {}: {e}", path.display()))?;
    serde_json::from_str(&data)
        .map_err(|e| format!("Failed to parse {}: {e}", path.display()))
}

fn write_auth_file(app: &tauri::AppHandle, auth: &AuthFile) -> Result<(), String> {
    let path = auth_path(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create dir {}: {e}", parent.display()))?;
    }
    let json = serde_json::to_string_pretty(auth)
        .map_err(|e| format!("Failed to serialize auth: {e}"))?;
    fs::write(&path, json.as_bytes())
        .map_err(|e| format!("Failed to write {}: {e}", path.display()))
}

fn auth_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let base = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to resolve app config dir: {e}"))?;
    Ok(base.join("auth.json"))
}
