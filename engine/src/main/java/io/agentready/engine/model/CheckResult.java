package io.agentready.engine.model;

import java.util.List;

public record CheckResult(
        String id,
        String name,
        CheckStatus status,
        String message,
        String remediation,
        List<Evidence> evidence,
        Integer durationMs) {

    public CheckResult {
        evidence = evidence == null ? List.of() : List.copyOf(evidence);
    }
}
