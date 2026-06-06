export type Verdict = "READY_TO_COMMIT" | "NOT_READY" | "NEEDS_REVIEW";

export type CheckStatus = "pass" | "warn" | "fail" | "skip";

export type FindingSeverity = "warn" | "fail";

export type TestResultStatus = "pass" | "fail" | "warn" | "skip" | "error";

export interface FeatureSessionInput {
  title: string;
  description: string;
}

export interface DiffSummary {
  added: string[];
  modified: string[];
  deleted: string[];
  totalFiles: number;
  totalChangedLines: number;
}

export interface CheckSummary {
  pass: number;
  warn: number;
  fail: number;
  skip: number;
  total: number;
}

export interface Evidence {
  kind: "file" | "hunk" | "pattern" | "keyword" | "note";
  path: string;
  detail?: string;
}

export interface CheckResult {
  id: string;
  name: string;
  status: CheckStatus;
  message: string;
  remediation?: string;
  evidence?: Evidence[];
  durationMs?: number;
}

export interface Finding {
  checkId: string;
  severity: FindingSeverity;
  message: string;
  paths?: string[];
}

export interface TestResult {
  ran: boolean;
  status: TestResultStatus;
  command?: string;
  exitCode?: number;
  durationMs?: number;
  stdoutSnippet?: string;
  stderrSnippet?: string;
  message?: string;
}

export interface GitContext {
  branch?: string;
  baseCommit?: string;
  isDirty?: boolean;
  stagedFileCount?: number;
  unstagedFileCount?: number;
}

export interface ReadinessReport {
  schemaVersion: "1.0";
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

export type AppScreen = "repo" | "session" | "results";

export interface AppState {
  screen: AppScreen;
  repoPath: string;
  session: FeatureSessionInput;
  featureSpec: import("./engine").FeatureSpec | null;
  currentSession: import("../lib/storage").CurrentSession | null;
  report: ReadinessReport | null;
}
