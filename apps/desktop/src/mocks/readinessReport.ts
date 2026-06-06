/**
 * Legacy frontend-only mock. The main run-check path uses the Java engine via Tauri.
 * Kept temporarily as a reference shape for local UI experiments in the browser.
 */
import type { FeatureSessionInput, ReadinessReport } from "../types";

export function buildMockReport(
  repoPath: string,
  session: FeatureSessionInput,
): ReadinessReport {
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
    checks: [],
    findings: [],
    passedChecks: [],
    testResult: {
      ran: false,
      status: "skip",
      message: "Frontend mock only",
    },
    repairPrompt: `Feature: ${session.title}\nRequest: ${session.description}`,
  };
}
