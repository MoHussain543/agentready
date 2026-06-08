use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EngineRequest {
    pub protocol_version: String,
    pub command: String,
    pub repo_path: String,
    pub feature_spec: Option<FeatureSpec>,
    pub options: Option<EngineOptions>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FeatureSpec {
    pub schema_version: String,
    pub id: String,
    pub title: String,
    pub original_feature_description: String,
    pub expected_keywords: Vec<String>,
    pub expected_status_codes: Vec<i32>,
    pub risk_keywords: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EngineOptions {
    pub check_suite: Option<String>,
    pub large_diff_max_lines: Option<i32>,
    pub large_diff_max_files: Option<i32>,
    pub include_staged: Option<bool>,
    pub include_unstaged: Option<bool>,
    pub run_tests: Option<bool>,
    pub test_command: Option<String>,
    pub test_command_cwd: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EngineResponse {
    pub protocol_version: String,
    pub status: String,
    pub report: Option<ReadinessReport>,
    pub error: Option<EngineError>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineError {
    pub code: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReadinessReport {
    pub schema_version: String,
    pub generated_at: String,
    pub repo_path: String,
    pub check_suite: String,
    pub engine_version: String,
    pub app_version: Option<String>,
    pub duration_ms: Option<i32>,
    pub feature_spec_id: Option<String>,
    pub git: Option<GitContext>,
    pub verdict: String,
    pub verdict_explanation: Option<String>,
    pub diff_summary: DiffSummary,
    pub summary: CheckSummary,
    pub checks: Vec<CheckResult>,
    pub findings: Option<Vec<Finding>>,
    pub passed_checks: Option<Vec<String>>,
    pub test_result: Option<TestResult>,
    pub repair_prompt: String,
    pub pro_review: Option<ProReview>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProReview {
    pub aligned: bool,
    pub confidence: String,
    pub summary: String,
    pub unrelated_files: Vec<String>,
    pub scope_creep: Vec<String>,
    pub misleading_copy: Vec<String>,
    pub suggested_fixes: Vec<String>,
    pub skipped: Option<bool>,
    pub skip_reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitContext {
    pub branch: Option<String>,
    pub base_commit: Option<String>,
    pub is_dirty: Option<bool>,
    pub staged_file_count: Option<i32>,
    pub unstaged_file_count: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiffSummary {
    pub added: Vec<String>,
    pub modified: Vec<String>,
    pub deleted: Vec<String>,
    pub total_files: i32,
    pub total_changed_lines: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckSummary {
    pub pass: i32,
    pub warn: i32,
    pub fail: i32,
    pub skip: i32,
    pub total: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckResult {
    pub id: String,
    pub name: String,
    pub status: String,
    pub message: String,
    pub remediation: Option<String>,
    pub evidence: Option<Vec<Evidence>>,
    pub duration_ms: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Evidence {
    pub kind: String,
    pub path: String,
    pub detail: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Finding {
    pub check_id: String,
    pub severity: String,
    pub message: String,
    pub paths: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TestResult {
    pub ran: bool,
    pub status: String,
    pub command: Option<String>,
    pub exit_code: Option<i32>,
    pub duration_ms: Option<i32>,
    pub stdout_snippet: Option<String>,
    pub stderr_snippet: Option<String>,
    pub message: Option<String>,
}
