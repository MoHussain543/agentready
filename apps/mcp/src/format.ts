import type { ReadinessReport } from "./types.js";

const VERDICT_ICON: Record<string, string> = {
  READY_TO_COMMIT: "✅",
  NEEDS_REVIEW: "⚠️",
  NOT_READY: "❌",
};

const VERDICT_LABEL: Record<string, string> = {
  READY_TO_COMMIT: "READY TO COMMIT",
  NEEDS_REVIEW: "NEEDS REVIEW",
  NOT_READY: "NOT READY",
};

const STATUS_ICON: Record<string, string> = {
  pass: "✅",
  warn: "⚠️",
  fail: "❌",
  skip: "⏭️",
};

export function formatReport(report: ReadinessReport, featureDescription?: string): string {
  const verdictIcon = VERDICT_ICON[report.verdict] ?? "❓";
  const verdictLabel = VERDICT_LABEL[report.verdict] ?? report.verdict;
  const { added, modified, deleted, totalChangedLines } = report.diffSummary;
  const changesSummary = `${added.length} added · ${modified.length} modified · ${deleted.length} deleted · ${totalChangedLines} lines changed`;

  let date: string;
  try {
    date = new Date(report.generatedAt).toLocaleString();
  } catch {
    date = report.generatedAt;
  }

  const lines: string[] = [];

  lines.push("## AgentReady Pre-commit Check", "");
  lines.push(`**Repo:** ${report.repoPath}`);
  if (featureDescription) lines.push(`**Feature:** ${featureDescription}`);
  lines.push(`**Date:** ${date}`, "");
  lines.push("---", "");
  lines.push(`### Verdict: ${verdictIcon} ${verdictLabel}`);
  if (report.verdictExplanation) lines.push(`> ${report.verdictExplanation}`);
  lines.push("", `**Changes:** ${changesSummary}`, "");

  if (report.checks.length > 0) {
    lines.push("### Checks");
    for (const check of report.checks) {
      const icon = STATUS_ICON[check.status] ?? "•";
      lines.push(`- ${icon} **${check.name}** — ${check.message}`);
      if (check.remediation) lines.push(`  > ${check.remediation}`);
    }
    lines.push("");
  }

  if (report.repairPrompt) {
    lines.push("### Repair Prompt");
    lines.push(report.repairPrompt, "");
  }

  const pr = report.proReview;
  if (pr) {
    lines.push("---", "");
    if (pr.skipped) {
      lines.push(`*Pro review skipped: ${pr.skipReason ?? "unavailable"}*`, "");
    } else {
      const alignIcon = pr.aligned ? "✅" : "❌";
      lines.push("### Pro Alignment Review");
      lines.push(`**Aligned:** ${alignIcon} ${pr.aligned ? "Yes" : "No"} *(${pr.confidence} confidence)*`);
      if (pr.summary) lines.push(`**Summary:** ${pr.summary}`);
      if (pr.suggestedFixes.length > 0) {
        lines.push("", "**Suggested fixes:**");
        for (const fix of pr.suggestedFixes) lines.push(`- ${fix}`);
      }
      if (pr.scopeCreep.length > 0) {
        lines.push("", "**Scope creep:**");
        for (const f of pr.scopeCreep) lines.push(`- ${f}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}
