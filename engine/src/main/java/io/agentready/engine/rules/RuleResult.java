package io.agentready.engine.rules;

import io.agentready.engine.model.CheckStatus;
import io.agentready.engine.model.Evidence;

import java.util.List;

/**
 * Outcome of evaluating a {@link Rule}. Converted into a CheckResult (and a Finding for
 * warn/fail outcomes) by the runner.
 */
public record RuleResult(
        CheckStatus status,
        String message,
        String remediation,
        List<Evidence> evidence) {

    public RuleResult {
        evidence = evidence == null ? List.of() : List.copyOf(evidence);
    }

    public static RuleResult pass(String message, List<Evidence> evidence) {
        return new RuleResult(CheckStatus.pass, message, null, evidence);
    }

    public static RuleResult warn(String message, String remediation, List<Evidence> evidence) {
        return new RuleResult(CheckStatus.warn, message, remediation, evidence);
    }

    public static RuleResult fail(String message, String remediation, List<Evidence> evidence) {
        return new RuleResult(CheckStatus.fail, message, remediation, evidence);
    }

    public static RuleResult skip(String message) {
        return new RuleResult(CheckStatus.skip, message, null, List.of());
    }
}
