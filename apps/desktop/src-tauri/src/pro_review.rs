use reqwest::Client;
use serde::Deserialize;
use serde_json::json;

use crate::models::{EngineRequest, ProReview, ReadinessReport};

const MAX_FILES: i32 = 50;
const MAX_LINES: i32 = 5000;
const REVIEW_API_URL: &str = "https://agentready-api.vercel.app/api/review";

// Baked in at compile time from the AGENTREADY_TOKEN env var.
// None in dev builds where the var isn't set — pro review is silently skipped.
const APP_TOKEN: Option<&str> = option_env!("AGENTREADY_TOKEN");

pub async fn run_if_eligible(request: &EngineRequest, report: &mut ReadinessReport) {
    let token = match APP_TOKEN {
        Some(t) if !t.is_empty() => t,
        _ => return, // no token baked in — skip silently in dev builds
    };

    let spec = match &request.feature_spec {
        Some(s) => s,
        None => {
            report.pro_review = Some(skipped("No feature description was provided."));
            return;
        }
    };

    if report.diff_summary.total_files > MAX_FILES
        || report.diff_summary.total_changed_lines > MAX_LINES
    {
        report.pro_review = Some(skipped(&format!(
            "Diff too large for AI review ({} files, {} lines). Limit: {} files / {} lines.",
            report.diff_summary.total_files,
            report.diff_summary.total_changed_lines,
            MAX_FILES,
            MAX_LINES
        )));
        return;
    }

    let mut all_files: Vec<String> = vec![];
    all_files.extend_from_slice(&report.diff_summary.added);
    all_files.extend_from_slice(&report.diff_summary.modified);
    all_files.extend_from_slice(&report.diff_summary.deleted);

    let free_issues: Vec<String> = report
        .findings
        .as_deref()
        .unwrap_or(&[])
        .iter()
        .filter(|f| f.severity == "fail" || f.severity == "warn")
        .map(|f| format!("[{}] {}", f.severity.to_uppercase(), f.message))
        .collect();

    let body = json!({
        "featureRequest": spec.original_feature_description,
        "changedFiles": all_files,
        "totalChangedLines": report.diff_summary.total_changed_lines,
        "freeFindings": free_issues,
    });

    let client = match Client::builder().build() {
        Ok(c) => c,
        Err(e) => {
            eprintln!("[pro_review] Failed to build HTTP client: {e}");
            return;
        }
    };

    let response = match client
        .post(REVIEW_API_URL)
        .header("x-agentready-token", token)
        .header("content-type", "application/json")
        .json(&body)
        .send()
        .await
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("[pro_review] Network error: {e}");
            return;
        }
    };

    if !response.status().is_success() {
        eprintln!("[pro_review] API error: HTTP {}", response.status());
        return;
    }

    let parsed: ApiReviewResponse = match response.json().await {
        Ok(v) => v,
        Err(e) => {
            eprintln!("[pro_review] Failed to parse API response: {e}");
            return;
        }
    };

    report.pro_review = Some(ProReview {
        aligned: parsed.aligned,
        confidence: parsed.confidence,
        summary: parsed.summary,
        unrelated_files: parsed.unrelated_files,
        scope_creep: parsed.scope_creep,
        misleading_copy: parsed.misleading_copy,
        suggested_fixes: parsed.suggested_fixes,
        skipped: Some(false),
        skip_reason: None,
    });
}

fn skipped(reason: &str) -> ProReview {
    ProReview {
        aligned: false,
        confidence: "low".to_string(),
        summary: String::new(),
        unrelated_files: vec![],
        scope_creep: vec![],
        misleading_copy: vec![],
        suggested_fixes: vec![],
        skipped: Some(true),
        skip_reason: Some(reason.to_string()),
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ApiReviewResponse {
    aligned: bool,
    confidence: String,
    summary: String,
    #[serde(default)]
    unrelated_files: Vec<String>,
    #[serde(default)]
    scope_creep: Vec<String>,
    #[serde(default)]
    misleading_copy: Vec<String>,
    #[serde(default)]
    suggested_fixes: Vec<String>,
}
