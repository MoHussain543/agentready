import type {
  CheckResult,
  CheckSummary,
  DiffSummary,
  Finding,
  GitContext,
  ReadinessReport,
  TestResult,
  Verdict,
} from "./index";

export interface FeatureSpec {
  schemaVersion: "1.0";
  id: string;
  title: string;
  originalFeatureDescription: string;
  expectedKeywords: string[];
  expectedStatusCodes: number[];
  riskKeywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EngineOptions {
  checkSuite?: string;
  largeDiffMaxLines?: number;
  largeDiffMaxFiles?: number;
  includeStaged?: boolean;
  includeUnstaged?: boolean;
}

export interface EngineRequest {
  protocolVersion: "1.0";
  command: "run_readiness";
  repoPath: string;
  featureSpec: FeatureSpec;
  options?: EngineOptions;
}

export interface EngineError {
  code: string;
  message: string;
}

export interface EngineResponse {
  protocolVersion: string;
  status: "ok" | "error";
  report?: ReadinessReport;
  error?: EngineError;
}

/** Wire-format report returned by Tauri (camelCase from Rust serde). */
export interface ReadinessReportWire {
  schemaVersion: string;
  generatedAt: string;
  repoPath: string;
  checkSuite: string;
  engineVersion: string;
  appVersion?: string;
  durationMs?: number;
  featureSpecId?: string;
  git?: GitContext;
  verdict: Verdict;
  diffSummary: DiffSummary;
  summary: CheckSummary;
  checks: CheckResult[];
  findings?: Finding[];
  passedChecks?: string[];
  testResult?: TestResult;
  repairPrompt: string;
}
