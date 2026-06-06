import { invoke } from "@tauri-apps/api/core";

import { buildFeatureSpec } from "./featureSpec";
import type { FeatureSessionInput, ReadinessReport } from "../types";
import type {
  EngineRequest,
  FeatureSpec,
  ReadinessReportWire,
} from "../types/engine";

const DEFAULT_OPTIONS: EngineRequest["options"] = {
  checkSuite: "free-v1-precommit",
  largeDiffMaxLines: 2000,
  largeDiffMaxFiles: 50,
  includeStaged: true,
  includeUnstaged: true,
};

export function buildEngineRequest(
  repoPath: string,
  session: FeatureSessionInput,
  featureSpec?: FeatureSpec,
): EngineRequest {
  return {
    protocolVersion: "1.0",
    command: "run_readiness",
    repoPath: repoPath.trim(),
    featureSpec: featureSpec ?? buildFeatureSpec(session),
    options: DEFAULT_OPTIONS,
  };
}

export async function runReadinessCheck(
  repoPath: string,
  session: FeatureSessionInput,
  featureSpec?: FeatureSpec,
): Promise<ReadinessReport> {
  const request = buildEngineRequest(repoPath, session, featureSpec);

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
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Readiness check failed due to an unknown error.";
}
