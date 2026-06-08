import { BAKED_APP_TOKEN } from "./constants.js";
import type { ProReview, ReadinessReport } from "./types.js";

const REVIEW_API_URL = "https://agentready-api.vercel.app/api/review";
const MAX_FILES = 50;
const MAX_LINES = 5000;

export async function runProReview(
  report: ReadinessReport,
  userToken: string,
  featureDescription: string,
): Promise<void> {
  // Prefer the token baked in at build time; fall back to runtime env for local dev.
  const appToken = BAKED_APP_TOKEN || process.env.AGENTREADY_TOKEN;
  if (!appToken) {
    report.proReview = skipped("Pro review unavailable: build without AGENTREADY_TOKEN set.");
    return;
  }

  const { diffSummary } = report;
  if (diffSummary.totalFiles > MAX_FILES || diffSummary.totalChangedLines > MAX_LINES) {
    report.proReview = skipped(
      `Diff too large for AI review (${diffSummary.totalFiles} files, ${diffSummary.totalChangedLines} lines).`
    );
    return;
  }

  const allFiles = [...diffSummary.added, ...diffSummary.modified, ...diffSummary.deleted];
  const freeFindings = (report.findings ?? [])
    .filter((f) => f.severity === "fail" || f.severity === "warn")
    .map((f) => `[${f.severity.toUpperCase()}] ${f.message}`);

  let response: Response;
  try {
    response = await fetch(REVIEW_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-agentready-token": appToken,
        "x-agentready-user-token": userToken,
      },
      body: JSON.stringify({
        featureRequest: featureDescription,
        changedFiles: allFiles,
        totalChangedLines: diffSummary.totalChangedLines,
        freeFindings,
      }),
    });
  } catch {
    return; // network failure — skip silently, free check result still returned
  }

  if (response.status === 401 || response.status === 403) {
    report.proReview = skipped("Session expired or subscription inactive. Check AGENTREADY_USER_TOKEN.");
    return;
  }
  if (!response.ok) return;

  try {
    const parsed = (await response.json()) as {
      aligned: boolean;
      confidence: string;
      summary: string;
      unrelatedFiles?: string[];
      scopeCreep?: string[];
      misleadingCopy?: string[];
      suggestedFixes?: string[];
    };
    report.proReview = {
      aligned: parsed.aligned,
      confidence: parsed.confidence,
      summary: parsed.summary,
      unrelatedFiles: parsed.unrelatedFiles ?? [],
      scopeCreep: parsed.scopeCreep ?? [],
      misleadingCopy: parsed.misleadingCopy ?? [],
      suggestedFixes: parsed.suggestedFixes ?? [],
      skipped: false,
    };
  } catch {
    // malformed response — leave proReview unset
  }
}

function skipped(reason: string): ProReview {
  return {
    aligned: false,
    confidence: "low",
    summary: "",
    unrelatedFiles: [],
    scopeCreep: [],
    misleadingCopy: [],
    suggestedFixes: [],
    skipped: true,
    skipReason: reason,
  };
}
