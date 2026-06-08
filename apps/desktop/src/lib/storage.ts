import { invoke } from "@tauri-apps/api/core";

import type { ReadinessReport, Verdict } from "../types";
import type { FeatureSpec } from "../types/engine";

export interface CurrentSession {
  schemaVersion: string;
  repoPath: string;
  repoName?: string | null;
  openedAt: string;
  lastAccessedAt: string;
  lastReadinessRunAt?: string | null;
  latestReportPath?: string | null;
  latestReportVerdict?: Verdict | null;
  activeFeatureSpecId?: string | null;
  featureSpecPath: string;
  reportHistoryCount?: number | null;
  appVersion?: string | null;
  testCommand?: string | null;
  testCommandCwd?: string | null;
}

export interface RepoSessionState {
  session: CurrentSession;
  featureSpec: FeatureSpec | null;
  latestReport: ReadinessReport | null;
}

export interface ReportHistoryEntry {
  fileName: string;
  path: string;
  generatedAt: string;
  verdict: Verdict;
  featureTitle?: string | null;
  verdictExplanation?: string | null;
  totalFiles: number;
  warnCount: number;
  failCount: number;
  testStatus?: string | null;
}

export async function initRepoStorage(
  repoPath: string,
): Promise<RepoSessionState> {
  try {
    return await invoke<RepoSessionState>("init_repo_storage", {
      repoPath: repoPath.trim(),
    });
  } catch (error) {
    throw new Error(
      formatError(error, "Failed to initialize AgentReady storage."),
    );
  }
}

export async function saveFeatureSession(
  repoPath: string,
  featureSpec: FeatureSpec,
): Promise<RepoSessionState> {
  try {
    return await invoke<RepoSessionState>("save_feature_session", {
      repoPath: repoPath.trim(),
      featureSpec,
    });
  } catch (error) {
    throw new Error(formatError(error, "Failed to save the feature session."));
  }
}

export async function loadRepoSession(
  repoPath: string,
): Promise<RepoSessionState | null> {
  try {
    return await invoke<RepoSessionState | null>("load_repo_session", {
      repoPath: repoPath.trim(),
    });
  } catch (error) {
    throw new Error(formatError(error, "Failed to load the repo session."));
  }
}

export async function setTestCommand(
  repoPath: string,
  command: string | null,
  cwd: string | null,
): Promise<CurrentSession> {
  try {
    return await invoke<CurrentSession>("set_test_command", {
      repoPath: repoPath.trim(),
      command: command && command.trim().length > 0 ? command.trim() : null,
      cwd: cwd && cwd.trim().length > 0 ? cwd.trim() : null,
    });
  } catch (error) {
    throw new Error(formatError(error, "Failed to save the test command."));
  }
}

export async function saveReport(
  repoPath: string,
  report: ReadinessReport,
): Promise<CurrentSession> {
  try {
    return await invoke<CurrentSession>("save_report", {
      repoPath: repoPath.trim(),
      report,
    });
  } catch (error) {
    throw new Error(formatError(error, "Failed to save the readiness report."));
  }
}

export async function loadLatestReport(
  repoPath: string,
): Promise<ReadinessReport | null> {
  try {
    return await invoke<ReadinessReport | null>("load_latest_report", {
      repoPath: repoPath.trim(),
    });
  } catch (error) {
    throw new Error(formatError(error, "Failed to load the latest report."));
  }
}

export async function loadReportByPath(
  repoPath: string,
  reportPath: string,
): Promise<ReadinessReport> {
  try {
    return await invoke<ReadinessReport>("load_report_by_path", {
      repoPath: repoPath.trim(),
      reportPath,
    });
  } catch (error) {
    throw new Error(formatError(error, "Failed to load the selected report."));
  }
}

export async function listReports(
  repoPath: string,
): Promise<ReportHistoryEntry[]> {
  try {
    return await invoke<ReportHistoryEntry[]>("list_reports", {
      repoPath: repoPath.trim(),
    });
  } catch (error) {
    throw new Error(formatError(error, "Failed to list saved reports."));
  }
}

export async function deleteReport(
  repoPath: string,
  reportPath: string,
): Promise<void> {
  try {
    await invoke<void>("delete_report", {
      repoPath: repoPath.trim(),
      reportPath,
    });
  } catch (error) {
    throw new Error(formatError(error, "Failed to delete the report."));
  }
}

function formatError(error: unknown, fallback: string): string {
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
