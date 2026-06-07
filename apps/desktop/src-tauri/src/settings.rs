use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::Manager;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub java_binary_override: Option<String>,
    pub app_version: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
struct AppSettingsFile {
    java_binary_override: Option<String>,
}

pub fn load(app: &tauri::AppHandle) -> Result<AppSettings, String> {
    let stored = read_settings_file(app)?;
    Ok(AppSettings {
        java_binary_override: stored.java_binary_override,
        app_version: app_version(),
    })
}

pub fn save(
    app: &tauri::AppHandle,
    java_binary_override: Option<String>,
) -> Result<AppSettings, String> {
    let normalized = java_binary_override
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let next = AppSettingsFile {
        java_binary_override: normalized,
    };
    write_settings_file(app, &next)?;

    Ok(AppSettings {
        java_binary_override: next.java_binary_override,
        app_version: app_version(),
    })
}

pub fn java_binary_override(app: &tauri::AppHandle) -> Option<String> {
    read_settings_file(app)
        .ok()
        .and_then(|settings| settings.java_binary_override)
}

fn read_settings_file(app: &tauri::AppHandle) -> Result<AppSettingsFile, String> {
    let path = settings_path(app)?;
    if !path.exists() {
        return Ok(AppSettingsFile::default());
    }

    let data = fs::read_to_string(&path)
        .map_err(|error| format!("Failed to read {}: {error}", path.display()))?;
    serde_json::from_str::<AppSettingsFile>(&data)
        .map_err(|error| format!("Failed to parse {}: {error}", path.display()))
}

fn write_settings_file(app: &tauri::AppHandle, settings: &AppSettingsFile) -> Result<(), String> {
    let path = settings_path(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Failed to create {}: {error}", parent.display()))?;
    }

    let json = serde_json::to_string_pretty(settings)
        .map_err(|error| format!("Failed to serialize {}: {error}", path.display()))?;
    fs::write(&path, json.as_bytes())
        .map_err(|error| format!("Failed to write {}: {error}", path.display()))
}

fn settings_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let base = app
        .path()
        .app_config_dir()
        .map_err(|error| format!("Failed to resolve app config dir: {error}"))?;
    Ok(base.join("settings.json"))
}

fn app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}
