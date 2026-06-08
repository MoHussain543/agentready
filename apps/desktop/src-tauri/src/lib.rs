mod auth;
mod contextforge;
mod engine;
mod models;
mod narrate;
mod pro_review;
mod settings;
mod storage;

use tauri::Emitter;

use models::{EngineRequest, FeatureSpec, ReadinessReport};
use settings::AppSettings;
use storage::{CurrentSession, ReportHistoryEntry, RepoSessionState};

#[tauri::command]
async fn run_readiness(app: tauri::AppHandle, request: EngineRequest) -> Result<ReadinessReport, String> {
    engine::run_readiness(&app, request).await
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
    cwd: Option<String>,
) -> Result<CurrentSession, String> {
    storage::set_test_command(&repo_path, command, cwd)
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
fn load_report_by_path(
    repo_path: String,
    report_path: String,
) -> Result<ReadinessReport, String> {
    storage::load_report_by_path(&repo_path, &report_path)
}

#[tauri::command]
fn list_reports(repo_path: String) -> Result<Vec<ReportHistoryEntry>, String> {
    storage::list_reports(&repo_path)
}

#[tauri::command]
fn delete_report(repo_path: String, report_path: String) -> Result<(), String> {
    storage::delete_report(&repo_path, &report_path)
}

#[tauri::command]
fn load_app_settings(app: tauri::AppHandle) -> Result<AppSettings, String> {
    settings::load(&app)
}

#[tauri::command]
fn save_app_settings(
    app: tauri::AppHandle,
    java_binary_override: Option<String>,
) -> Result<AppSettings, String> {
    settings::save(&app, java_binary_override)
}

#[tauri::command]
fn get_auth_token(app: tauri::AppHandle) -> Option<String> {
    auth::load_token(&app)
}

#[tauri::command]
fn save_auth_token(app: tauri::AppHandle, token: String) -> Result<(), String> {
    auth::save_token(&app, token)
}

#[tauri::command]
fn clear_auth_token(app: tauri::AppHandle) -> Result<(), String> {
    auth::clear_token(&app)
}

#[tauri::command]
async fn generate_narrative(input: narrate::NarrateInput) -> Result<narrate::NarrateOutput, String> {
    narrate::generate(input).await
}

/// Opens the sign-in page in the default browser using a local HTTP callback server.
/// The browser signs the user in, then redirects to our local server with the token.
/// No URL scheme registration required — works in dev mode and production.
#[tauri::command]
async fn open_sign_in(app: tauri::AppHandle) -> Result<(), String> {
    use tokio::io::{AsyncReadExt, AsyncWriteExt};
    use tokio::net::TcpListener;

    let listener = TcpListener::bind("127.0.0.1:0")
        .await
        .map_err(|e| format!("Failed to start callback server: {e}"))?;

    let port = listener
        .local_addr()
        .map_err(|e| format!("Failed to get port: {e}"))?
        .port();

    let callback = format!("http://127.0.0.1:{port}/callback");
    let sign_in_url = format!(
        "https://agentreadyai.dev/auth/desktop?callback={}",
        percent_encode(&callback),
    );

    open_browser(&sign_in_url)?;

    // Accept the single callback request in the background
    tokio::spawn(async move {
        let accept = tokio::time::timeout(
            std::time::Duration::from_secs(300),
            listener.accept(),
        )
        .await;

        let (mut stream, _) = match accept {
            Ok(Ok(conn)) => conn,
            _ => return,
        };

        let mut buf = vec![0u8; 8192];
        let n = stream.read(&mut buf).await.unwrap_or(0);
        let request = String::from_utf8_lossy(&buf[..n]).to_string();

        let token = parse_token_from_http_request(&request);

        let (status, body) = if token.is_some() {
            (
                "200 OK",
                "<html><body style='font-family:sans-serif;text-align:center;padding:60px'>\
                 <h2>Signed in to AgentReady!</h2>\
                 <p>You can close this tab and return to the app.</p>\
                 <script>setTimeout(()=>window.close(),1500)</script>\
                 </body></html>",
            )
        } else {
            (
                "400 Bad Request",
                "<html><body style='font-family:sans-serif;text-align:center;padding:60px'>\
                 <h2>Sign-in failed.</h2><p>Please try again.</p>\
                 </body></html>",
            )
        };

        let response = format!(
            "HTTP/1.1 {status}\r\nContent-Type: text/html\r\nContent-Length: {}\r\n\r\n{body}",
            body.len()
        );
        let _ = stream.write_all(response.as_bytes()).await;
        drop(stream);

        if let Some(t) = token {
            if auth::save_token(&app, t).is_ok() {
                let _ = app.emit("auth-token-saved", ());
            }
        }
    });

    Ok(())
}

fn open_browser(url: &str) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    std::process::Command::new("open")
        .arg(url)
        .spawn()
        .map_err(|e| e.to_string())?;
    #[cfg(target_os = "windows")]
    std::process::Command::new("cmd")
        .args(["/c", "start", url])
        .spawn()
        .map_err(|e| e.to_string())?;
    #[cfg(target_os = "linux")]
    std::process::Command::new("xdg-open")
        .arg(url)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

fn parse_token_from_http_request(request: &str) -> Option<String> {
    // First line: "GET /callback?token=JWT HTTP/1.1"
    let path = request.lines().next()?.split_whitespace().nth(1)?;
    let query = path.splitn(2, '?').nth(1)?;
    for pair in query.split('&') {
        let mut kv = pair.splitn(2, '=');
        if kv.next() == Some("token") {
            return kv.next().map(|v| v.to_string());
        }
    }
    None
}

fn percent_encode(s: &str) -> String {
    let mut out = String::with_capacity(s.len() * 3);
    for byte in s.bytes() {
        match byte {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                out.push(byte as char);
            }
            _ => {
                out.push_str(&format!("%{byte:02X}"));
            }
        }
    }
    out
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            // Handle deep links for production bundled app (URL scheme registered via Info.plist)
            use tauri_plugin_deep_link::DeepLinkExt;
            let handle = app.handle().clone();
            app.deep_link().on_open_url(move |event| {
                for url in event.urls() {
                    if url.scheme() == "agentready" && url.host_str() == Some("auth") {
                        if let Some(token) = url
                            .query_pairs()
                            .find(|(k, _)| k == "token")
                            .map(|(_, v)| v.to_string())
                        {
                            if auth::save_token(&handle, token).is_ok() {
                                let _ = handle.emit("auth-token-saved", ());
                            }
                        }
                    }
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            run_readiness,
            init_repo_storage,
            save_feature_session,
            load_repo_session,
            set_test_command,
            save_report,
            load_latest_report,
            load_report_by_path,
            list_reports,
            delete_report,
            load_app_settings,
            save_app_settings,
            get_auth_token,
            save_auth_token,
            clear_auth_token,
            open_sign_in,
            generate_narrative,
            contextforge::check_context_forge_status,
            contextforge::generate_context_files,
        ])
        .run(tauri::generate_context!())
        .expect("error while running AgentReady desktop");
}
