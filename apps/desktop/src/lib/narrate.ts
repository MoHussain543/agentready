import { invoke } from "@tauri-apps/api/core";
import type { DiffSummary, ProReview, TestResult } from "../types";

export interface NarrativeOutput {
  commitMessage: string;
  prTitle: string;
  prBody: string;
}

export async function generateNarrative(params: {
  featureTitle: string;
  featureDescription: string;
  verdict: string;
  diffSummary: DiffSummary;
  testResult: TestResult | undefined;
  proReview: ProReview | undefined;
  userToken: string;
}): Promise<NarrativeOutput> {
  const { featureTitle, featureDescription, verdict, diffSummary, testResult, proReview, userToken } = params;

  return invoke<NarrativeOutput>("generate_narrative", {
    input: {
      featureTitle,
      featureDescription,
      verdict,
      added: diffSummary.added,
      modified: diffSummary.modified,
      deleted: diffSummary.deleted,
      totalChangedLines: diffSummary.totalChangedLines,
      testStatus: testResult?.ran ? testResult.status : undefined,
      proAligned: proReview && !proReview.skipped ? proReview.aligned : undefined,
      proSummary: proReview && !proReview.skipped ? proReview.summary : undefined,
      userToken,
    },
  });
}
