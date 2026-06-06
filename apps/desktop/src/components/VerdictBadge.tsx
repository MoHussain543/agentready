import type { Verdict } from "../types";

const LABELS: Record<Verdict, string> = {
  READY_TO_COMMIT: "Ready to commit",
  NOT_READY: "Not ready",
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
