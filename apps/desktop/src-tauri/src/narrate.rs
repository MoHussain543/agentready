use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;

const NARRATE_API_URL: &str = "https://agentready-api.vercel.app/api/narrate";
const APP_TOKEN: Option<&str> = option_env!("AGENTREADY_TOKEN");

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NarrateInput {
    pub feature_title: String,
    pub feature_description: String,
    pub verdict: String,
    pub added: Vec<String>,
    pub modified: Vec<String>,
    pub deleted: Vec<String>,
    pub total_changed_lines: i32,
    pub test_status: Option<String>,
    pub pro_aligned: Option<bool>,
    pub pro_summary: Option<String>,
    pub user_token: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NarrateOutput {
    pub commit_message: String,
    pub pr_title: String,
    pub pr_body: String,
}

pub async fn generate(input: NarrateInput) -> Result<NarrateOutput, String> {
    let app_token = match APP_TOKEN {
        Some(t) if !t.is_empty() => t,
        _ => return Err("GitNarrator is not available in dev builds.".to_string()),
    };

    let body = json!({
        "featureTitle": input.feature_title,
        "featureDescription": input.feature_description,
        "verdict": input.verdict,
        "added": input.added,
        "modified": input.modified,
        "deleted": input.deleted,
        "totalChangedLines": input.total_changed_lines,
        "testStatus": input.test_status,
        "proAligned": input.pro_aligned,
        "proSummary": input.pro_summary,
    });

    let client = Client::builder()
        .build()
        .map_err(|e| format!("HTTP client error: {e}"))?;

    let response = client
        .post(NARRATE_API_URL)
        .header("x-agentready-token", app_token)
        .header("x-agentready-user-token", &input.user_token)
        .header("content-type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Network error: {e}"))?;

    let status = response.status();
    if status == 401 {
        return Err("Session expired. Open Settings to sign in again.".to_string());
    }
    if status == 429 {
        return Err("Too many requests. Try again in an hour.".to_string());
    }
    if !status.is_success() {
        let body_text = response.text().await.unwrap_or_default();
        return Err(format!("API error {status}: {body_text}"));
    }

    response
        .json::<NarrateOutput>()
        .await
        .map_err(|e| format!("Failed to parse response: {e}"))
}
