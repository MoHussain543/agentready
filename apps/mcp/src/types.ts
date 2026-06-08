export interface FeatureSpec {
  schemaVersion: string;
  id: string;
  title: string;
  originalFeatureDescription: string;
  expectedKeywords: string[];
  expectedStatusCodes: number[];
  riskKeywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EngineRequest {
  protocolVersion: string;
  command: string;
  repoPath: string;
  featureSpec?: FeatureSpec;
  options?: {
    checkSuite?: string;
    includeStaged?: boolean;
    includeUnstaged?: boolean;
    runTests?: boolean;
    testCommand?: string;
    testCommandCwd?: string;
  };
}

export interface EngineResponse {
  protocolVersion: string;
  status: string;
  report?: ReadinessReport;
  error?: { code: string; message: string };
}

export interface ReadinessReport {
  schemaVersion: string;
  generatedAt: string;
  repoPath: string;
  checkSuite: string;
  engineVersion: string;
  verdict: string;
  verdictExplanation?: string;
  diffSummary: DiffSummary;
  summary: CheckSummary;
  checks: CheckResult[];
  findings?: Finding[];
  testResult?: TestResult;
  repairPrompt: string;
  proReview?: ProReview;
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

export interface CheckResult {
  id: string;
  name: string;
  status: string;
  message: string;
  remediation?: string;
}

export interface Finding {
  checkId: string;
  severity: string;
  message: string;
  paths?: string[];
}

export interface TestResult {
  ran: boolean;
  status: string;
  exitCode?: number;
  stdoutSnippet?: string;
  stderrSnippet?: string;
  message?: string;
}

export interface ProReview {
  aligned: boolean;
  confidence: string;
  summary: string;
  unrelatedFiles: string[];
  scopeCreep: string[];
  misleadingCopy: string[];
  suggestedFixes: string[];
  skipped?: boolean;
  skipReason?: string;
}
