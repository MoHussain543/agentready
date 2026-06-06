package io.agentready.engine.model;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ReadinessReport(
        String schemaVersion,
        Instant generatedAt,
        String repoPath,
        String checkSuite,
        String engineVersion,
        String appVersion,
        Integer durationMs,
        UUID featureSpecId,
        GitContext git,
        Verdict verdict,
        String verdictExplanation,
        DiffSummary diffSummary,
        CheckSummary summary,
        List<CheckResult> checks,
        List<Finding> findings,
        List<String> passedChecks,
        TestResult testResult,
        String repairPrompt) {

    public ReadinessReport {
        checks = checks == null ? List.of() : List.copyOf(checks);
        findings = findings == null ? List.of() : List.copyOf(findings);
        passedChecks = passedChecks == null ? List.of() : List.copyOf(passedChecks);
    }
}
