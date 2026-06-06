package io.agentready.engine.cli;

import io.agentready.engine.model.ChangeType;
import io.agentready.engine.model.ChangedFile;
import io.agentready.engine.model.CheckResult;
import io.agentready.engine.model.CheckStatus;
import io.agentready.engine.model.CheckSummary;
import io.agentready.engine.model.DiffSummary;
import io.agentready.engine.model.EngineError;
import io.agentready.engine.model.EngineRequest;
import io.agentready.engine.model.EngineResponse;
import io.agentready.engine.model.Evidence;
import io.agentready.engine.model.EvidenceKind;
import io.agentready.engine.model.FeatureSpec;
import io.agentready.engine.model.Finding;
import io.agentready.engine.model.FindingSeverity;
import io.agentready.engine.model.GitContext;
import io.agentready.engine.model.ReadinessReport;
import io.agentready.engine.model.TestResult;
import io.agentready.engine.model.TestResultStatus;
import io.agentready.engine.model.Verdict;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Returns a deterministic mocked readiness report. Real git analysis is not implemented yet.
 */
public final class MockReadinessRunner implements EngineHandler {

    static final String ENGINE_VERSION = "0.1.0-SNAPSHOT";
    static final String DEFAULT_CHECK_SUITE = "free-v1-precommit@1";

    @Override
    public EngineResponse handle(EngineRequest request) {
        if (request == null) {
            return EngineResponse.error("1.0", new EngineError("INVALID_JSON", "Request is null"));
        }

        String protocolVersion = request.protocolVersion() == null ? "1.0" : request.protocolVersion();
        if (!"1.0".equals(protocolVersion)) {
            return EngineResponse.error(protocolVersion, new EngineError(
                    "UNSUPPORTED_VERSION", "Unsupported protocolVersion: " + protocolVersion));
        }
        if (!"run_readiness".equals(request.command())) {
            return EngineResponse.error(protocolVersion, new EngineError(
                    "UNKNOWN_COMMAND", "Unknown command: " + request.command()));
        }
        if (request.repoPath() == null || request.repoPath().isBlank()) {
            return EngineResponse.error(protocolVersion, new EngineError(
                    "INVALID_REPO", "repoPath is required"));
        }

        return EngineResponse.ok(protocolVersion, buildMockReport(request));
    }

    private ReadinessReport buildMockReport(EngineRequest request) {
        String checkSuite = request.options() != null && request.options().checkSuite() != null
                ? request.options().checkSuite()
                : DEFAULT_CHECK_SUITE;

        List<ChangedFile> changedFiles = List.of(
                new ChangedFile("src/api/UserController.java", ChangeType.MODIFIED),
                new ChangedFile("src/test/api/UserControllerTest.java", ChangeType.ADDED));
        DiffSummary diffSummary = DiffSummary.fromChangedFiles(changedFiles, 84);

        CheckResult changedFileSummary = new CheckResult(
                "changed-file-summary",
                "Changed file summary",
                CheckStatus.pass,
                "2 files changed in the mock diff",
                null,
                List.of(
                        new Evidence(EvidenceKind.file, "src/api/UserController.java", "modified"),
                        new Evidence(EvidenceKind.file, "src/test/api/UserControllerTest.java", "added")),
                1);

        CheckResult specKeywordMatch = new CheckResult(
                "spec-keyword-match",
                "Spec keyword match",
                CheckStatus.pass,
                "Mock: expected keywords found in diff",
                null,
                List.of(),
                1);

        List<CheckResult> checks = List.of(changedFileSummary, specKeywordMatch);
        CheckSummary summary = new CheckSummary(2, 0, 0, 0, 2);
        List<String> passedChecks = List.of("changed-file-summary", "spec-keyword-match");

        FeatureSpec spec = request.featureSpec();
        String repairPrompt = "Mock readiness report for " + request.repoPath()
                + (spec != null ? ". Feature: " + spec.title() : "")
                + ". No blocking issues detected.";

        return new ReadinessReport(
                "1.0",
                Instant.parse("2026-06-06T16:00:00Z"),
                request.repoPath(),
                checkSuite,
                ENGINE_VERSION,
                null,
                12,
                spec != null ? spec.id() : null,
                new GitContext("main", "abc1234", true, 1, 1),
                Verdict.READY_TO_COMMIT,
                diffSummary,
                summary,
                checks,
                List.<Finding>of(),
                passedChecks,
                new TestResult(false, TestResultStatus.skip, null, null, null, null, null,
                        "Test execution not requested in mock run"),
                repairPrompt);
    }
}
