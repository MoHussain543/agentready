import { invoke } from "@tauri-apps/api/core";

import { buildFeatureSpec } from "./featureSpec";
import type { FeatureSessionInput, ReadinessReport } from "../types";
import type {
  EngineRequest,
  FeatureSpec,
  ReadinessReportWire,
} from "../types/engine";

const BASE_OPTIONS: EngineRequest["options"] = {
  checkSuite: "free-v1-precommit",
  largeDiffMaxLines: 2000,
  largeDiffMaxFiles: 50,
  includeStaged: true,
  includeUnstaged: true,
};

export interface TestExecutionOptions {
  runTests?: boolean;
  testCommand?: string | null;
  testCommandCwd?: string | null;
}

export function buildEngineRequest(
  repoPath: string,
  session: FeatureSessionInput,
  featureSpec?: FeatureSpec,
  testOptions?: TestExecutionOptions,
): EngineRequest {
  return {
    protocolVersion: "1.0",
    command: "run_readiness",
    repoPath: repoPath.trim(),
    featureSpec: featureSpec ?? buildFeatureSpec(session),
    options: {
      ...BASE_OPTIONS,
      runTests: testOptions?.runTests ?? false,
      testCommand: testOptions?.testCommand?.trim() || undefined,
      testCommandCwd: testOptions?.testCommandCwd?.trim() || undefined,
    },
  };
}

export async function runReadinessCheck(
  repoPath: string,
  session: FeatureSessionInput,
  featureSpec?: FeatureSpec,
  testOptions?: TestExecutionOptions,
): Promise<ReadinessReport> {
  const request = buildEngineRequest(repoPath, session, featureSpec, testOptions);

  try {
    const report = await invoke<ReadinessReportWire>("run_readiness", {
      request,
    });
    return normalizeReport(report);
  } catch (error) {
    throw new Error(formatInvokeError(error));
  }
}

function normalizeReport(report: ReadinessReportWire): ReadinessReport {
  return {
    ...report,
    schemaVersion: "1.0",
  };
}

function formatInvokeError(error: unknown): string {
  const raw =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : "";
  return friendlyEngineError(raw);
}

/** Map raw engine error strings ("CODE: detail") to clear, user-facing copy. */
function friendlyEngineError(raw: string): string {
  if (!raw) {
    return "Readiness check failed due to an unknown error.";
  }
  if (raw.includes("NO_DIFF")) {
    return "No uncommitted changes to check yet. Make some edits, then run AgentReady.";
  }
  if (raw.includes("INVALID_REPO")) {
    return "This path is not a git repository. Open a folder that contains a .git directory.";
  }
  if (raw.includes("Failed to start Java engine")) {
    return "Could not start the verification engine — Java 21 or later is required. Install it from adoptium.net, or set AGENTREADY_JAVA to the path of your java binary.";
  }
  if (raw.includes("agentready-engine.jar") || raw.includes("Could not locate")) {
    return `Verification engine not found. ${raw}`;
  }
  return raw;
}
