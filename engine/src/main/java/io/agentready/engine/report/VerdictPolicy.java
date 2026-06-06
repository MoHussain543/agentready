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
}
