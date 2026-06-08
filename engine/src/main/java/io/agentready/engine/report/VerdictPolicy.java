package io.agentready.engine.report;

import io.agentready.engine.model.CheckResult;
import io.agentready.engine.model.CheckStatus;
import io.agentready.engine.model.Verdict;

import java.util.Collection;

/**
 * Maps check outcomes to an overall verdict.
 *
 * <ul>
 *   <li>any fail -&gt; NOT_READY</li>
 *   <li>else any warn -&gt; NEEDS_REVIEW</li>
 *   <li>else (all pass/skip) -&gt; READY_TO_COMMIT</li>
 * </ul>
 */
public final class VerdictPolicy {

    private VerdictPolicy() {}

    public static Verdict fromChecks(Collection<CheckResult> checks) {
        boolean anyWarn = false;
        for (CheckResult check : checks) {
            if (check.status() == CheckStatus.fail) {
                return Verdict.NOT_READY;
            }
            if (check.status() == CheckStatus.warn) {
                anyWarn = true;
            }
        }
        return anyWarn ? Verdict.NEEDS_REVIEW : Verdict.READY_TO_COMMIT;
    }

    /** Short, deterministic one-line explanation of a verdict for display. */
    public static String explain(Verdict verdict) {
        return switch (verdict) {
            case NOT_READY -> "A blocking issue or failing test was found in the current diff.";
            case NEEDS_REVIEW ->
                    "No blocking issues were found, but some changes need review.";
            case READY_TO_COMMIT -> "No obvious red flags were found in this diff.";
        };
    }
}
