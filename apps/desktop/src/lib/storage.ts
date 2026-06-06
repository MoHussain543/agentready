import { invoke } from "@tauri-apps/api/core";

import type { Verdict } from "../types";
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
}

export interface RepoSessionState {
  session: CurrentSession;
  featureSpec: FeatureSpec | null;
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

export async function recordReadinessRun(
  repoPath: string,
  verdict: Verdict,
): Promise<CurrentSession> {
  return invoke<CurrentSession>("record_readiness_run", {
    repoPath: repoPath.trim(),
    verdict,
  });
}

export async function setTestCommand(
  repoPath: string,
  command: string | null,
): Promise<CurrentSession> {
  try {
    return await invoke<CurrentSession>("set_test_command", {
      repoPath: repoPath.trim(),
      command: command && command.trim().length > 0 ? command.trim() : null,
    });
  } catch (error) {
    throw new Error(formatError(error, "Failed to save the test command."));
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
