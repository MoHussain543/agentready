use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::Manager;

const KEYCHAIN_SERVICE: &str = "agentready";
const KEYCHAIN_ACCOUNT: &str = "desktop-auth-token";

pub fn load_token(app: &tauri::AppHandle) -> Option<String> {
    // Try keychain first
    if let Some(token) = keychain_get() {
        return Some(token);
    }
    // One-time migration: read legacy file, write to keychain, then delete file
    // only if the keychain write succeeded — keeps the file as fallback otherwise
    if let Some((token, path)) = read_legacy_file(app) {
        if keychain_set(&token).is_ok() {
            let _ = fs::remove_file(&path);
        }
        return Some(token);
    }
    None
}

pub fn save_token(_app: &tauri::AppHandle, token: String) -> Result<(), String> {
    keychain_set(&token)
}

pub fn clear_token(app: &tauri::AppHandle) -> Result<(), String> {
    let _ = delete_legacy_file(app);
    keychain_delete()
}

// — keychain helpers —

fn keychain_entry() -> Result<keyring::Entry, String> {
    keyring::Entry::new(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT)
        .map_err(|e| format!("Keychain entry error: {e}"))
}

fn keychain_get() -> Option<String> {
    let entry = keychain_entry().ok()?;
    match entry.get_password() {
        Ok(token) => Some(token),
        Err(keyring::Error::NoEntry) => None,
        Err(e) => { eprintln!("[auth] Keychain read error: {e}"); None }
    }
}

fn keychain_set(token: &str) -> Result<(), String> {
    keychain_entry()?.set_password(token).map_err(|e| format!("Keychain write error: {e}"))
}

fn keychain_delete() -> Result<(), String> {
    match keychain_entry()?.delete_credential() {
        Ok(()) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(format!("Keychain delete error: {e}")),
    }
}

// — legacy file migration —

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
struct AuthFile {
    user_token: Option<String>,
}

fn legacy_auth_path(app: &tauri::AppHandle) -> Option<PathBuf> {
    app.path().app_config_dir().ok().map(|d| d.join("auth.json"))
}

fn read_legacy_file(app: &tauri::AppHandle) -> Option<(String, PathBuf)> {
    let path = legacy_auth_path(app)?;
    if !path.exists() {
        return None;
    }
    let data = fs::read_to_string(&path).ok()?;
    let auth: AuthFile = serde_json::from_str(&data).ok()?;
    let token = auth.user_token?;
    Some((token, path))
}

fn delete_legacy_file(app: &tauri::AppHandle) {
    if let Some(path) = legacy_auth_path(app) {
        let _ = fs::remove_file(path);
    }
}
