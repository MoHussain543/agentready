import type { FeatureSessionInput, ReadinessReport } from "../types";

function extractExpectedStatusCode(session: FeatureSessionInput): number | null {
  const match = `${session.title} ${session.description}`.match(/\b([1-5][0-9]{2})\b/);
  return match ? Number.parseInt(match[1], 10) : null;
}

export function buildMockReport(
  repoPath: string,
  session: FeatureSessionInput,
): ReadinessReport {
  const expectedStatusCode = extractExpectedStatusCode(session);
  const statusCodeMessage = expectedStatusCode
    ? `Expected status code ${expectedStatusCode} not found in diff hunks`
    : "No explicit status code found in the original request";
  const statusCodeRemediation = expectedStatusCode
    ? `Ensure the handler returns ${expectedStatusCode} as described in the feature request`
    : "Add an explicit expected status code to the feature request if one matters for verification";

  return {
    schemaVersion: "1.0",
    generatedAt: new Date().toISOString(),
    repoPath,
    checkSuite: "free-v1-precommit@1",
    engineVersion: "0.1.0-SNAPSHOT",
    appVersion: "0.1.0",
    durationMs: 18,
    featureSpecId: "00000000-0000-4000-8000-000000000001",
    git: {
      branch: "main",
      baseCommit: "abc1234",
      isDirty: true,
      stagedFileCount: 1,
      unstagedFileCount: 1,
    },
    verdict: "NEEDS_REVIEW",
    diffSummary: {
      added: ["src/test/api/UserControllerTest.java"],
      modified: ["src/api/UserController.java"],
      deleted: [],
      totalFiles: 2,
      totalChangedLines: 84,
    },
    summary: { pass: 5, warn: 2, fail: 0, skip: 1, total: 8 },
    checks: [
      {
        id: "changed-file-summary",
        name: "Changed file summary",
        status: "pass",
        message: "2 files changed in the uncommitted diff",
        evidence: [
          { kind: "file", path: "src/api/UserController.java", detail: "modified" },
          { kind: "file", path: "src/test/api/UserControllerTest.java", detail: "added" },
        ],
      },
      {
        id: "production-without-tests",
        name: "Production without tests",
        status: "pass",
        message: "Production and test files both changed",
      },
      {
        id: "spec-keyword-match",
        name: "Spec keyword match",
        status: "pass",
        message: `Keywords from "${session.title}" found in diff`,
      },
      {
        id: "status-code-match",
        name: "Status code match",
        status: expectedStatusCode ? "warn" : "skip",
        message: statusCodeMessage,
        remediation: statusCodeRemediation,
      },
      {
        id: "large-diff",
        name: "Large diff",
        status: "warn",
        message: "Diff is approaching the configured line threshold",
        remediation: "Consider splitting changes before commit",
      },
      {
        id: "hardcoded-secrets",
        name: "Hardcoded secrets",
        status: "pass",
        message: "No obvious secret patterns in changed hunks",
      },
      {
        id: "config-env-dependency-risk",
        name: "Config / env / dependency risk",
        status: "pass",
        message: "No risky config or dependency paths changed",
      },
      {
        id: "optional-test-run",
        name: "Optional test run",
        status: "skip",
        message: "Test command not configured for this repo",
      },
    ],
    findings: [
      ...(expectedStatusCode
        ? [
            {
              checkId: "status-code-match",
              severity: "warn" as const,
              message: statusCodeMessage,
              paths: ["src/api/UserController.java"],
            },
          ]
        : []),
      {
        checkId: "large-diff",
        severity: "warn",
        message: "Diff is approaching the configured line threshold",
        paths: ["src/api/UserController.java"],
      },
    ],
    passedChecks: [
      "changed-file-summary",
      "production-without-tests",
      "spec-keyword-match",
      "hardcoded-secrets",
      "config-env-dependency-risk",
    ],
    testResult: {
      ran: false,
      status: "skip",
      message: "Test execution not configured (mock)",
    },
    repairPrompt: [
      `Feature: ${session.title}`,
      `Request: ${session.description}`,
      "",
      "Verdict: NEEDS_REVIEW",
      "",
      "Please address the following before commit:",
      expectedStatusCode
        ? `- status-code-match: ensure ${expectedStatusCode} handling appears in src/api/UserController.java`
        : "- status-code-match: add a concrete expected status code to the feature request if needed",
      "- large-diff: consider splitting the change set",
      "",
      "Re-run AgentReady after fixes.",
    ].join("\n"),
  };
}
