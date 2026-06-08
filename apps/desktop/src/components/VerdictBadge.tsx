import type { Verdict } from "../types";

const LABELS: Record<Verdict, string> = {
  READY_TO_COMMIT: "No obvious red flags",
  NOT_READY: "Risk detected",
  NEEDS_REVIEW: "Needs review",
};

interface VerdictBadgeProps {
  verdict: Verdict;
}

export function VerdictBadge({ verdict }: VerdictBadgeProps) {
  return (
    <span className={`verdict verdict-${verdict.toLowerCase()}`}>
      {LABELS[verdict]}
    </span>
  );
}
