package io.agentready.engine.cli;

import io.agentready.engine.diff.FileClassifier;
import io.agentready.engine.git.GitException;
import io.agentready.engine.git.GitService;
import io.agentready.engine.model.ChangedFile;
import io.agentready.engine.model.CheckResult;
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
import io.agentready.engine.report.VerdictPolicy;
import io.agentready.engine.rules.Rule;
import io.agentready.engine.rules.RuleContext;
import io.agentready.engine.rules.RuleEngine;
import io.agentready.engine.rules.RuleResult;

import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Builds a readiness report from the real uncommitted git diff and the baseline rule engine.
 *
 * <p>Diff ingestion, git metadata, file classification, and the baseline rule suite are all
 * real. Test execution is still deferred to a later step.
 */
public final class ReadinessRunner implements EngineHandler {

    static final String ENGINE_VERSION = "0.1.0-SNAPSHOT";
    static final String DEFAULT_CHECK_SUITE = "free-v1-precommit@1";

    private final GitService gitService;
    private final FileClassifier classifier = new FileClassifier();

    public ReadinessRunner() {
        this(new GitService());
    }

    public ReadinessRunner(GitService gitService) {
        this.gitService = gitService;
    }

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

        Path repo = Path.of(request.repoPath());
        if (!gitService.isGitRepository(repo)) {
            return EngineResponse.error(protocolVersion, new EngineError(
                    "INVALID_REPO", "Path is not a git repository: " + request.repoPath()));
        }

        long startNanos = System.nanoTime();
        List<ChangedFile> changedFiles;
        GitContext gitContext;
        int changedLines;
        Map<String, List<String>> addedLines;
        try {
            changedFiles = gitService.changedFiles(repo);
            if (changedFiles.isEmpty()) {
                return EngineResponse.error(protocolVersion, new EngineError(
                        "NO_DIFF",
                        "No uncommitted changes to analyze in " + request.repoPath()));
            }
            gitContext = gitService.readGitContext(repo, changedFiles);
            changedLines = gitService.changedLineCount(repo);
            addedLines = gitService.addedLinesByPath(repo);
        } catch (GitException e) {
            return EngineResponse.error(protocolVersion, new EngineError(e.code(), e.getMessage()));
        }

        int durationMs = (int) ((System.nanoTime() - startNanos) / 1_000_000);
        ReadinessReport report = buildReport(
                request, resolveCheckSuite(request), changedFiles, gitContext,
                changedLines, addedLines, durationMs);
        return EngineResponse.ok(protocolVersion, report);
    }

    private static String resolveCheckSuite(EngineRequest request) {
        return request.options() != null && request.options().checkSuite() != null
                ? request.options().checkSuite()
                : DEFAULT_CHECK_SUITE;
    }

    private ReadinessReport buildReport(
            EngineRequest request,
            String checkSuite,
            List<ChangedFile> changedFiles,
            GitContext gitContext,
            int changedLines,
            Map<String, List<String>> addedLines,
            int durationMs) {

        RuleContext ruleContext = new RuleContext(
                request.repoPath(), changedFiles, classifier, addedLines, changedLines,
                request.options(), request.featureSpec());

        List<CheckResult> checks = new ArrayList<>();
        List<Finding> findings = new ArrayList<>();
        List<String> passedChecks = new ArrayList<>();
        int pass = 0;
        int warn = 0;
        int fail = 0;
        int skip = 0;

        for (Rule rule : RuleEngine.baselineRules()) {
            long ruleStart = System.nanoTime();
            RuleResult result = rule.evaluate(ruleContext);
            int ruleMs = (int) ((System.nanoTime() - ruleStart) / 1_000_000);

            checks.add(new CheckResult(
                    rule.id(), rule.name(), result.status(), result.message(),
                    result.remediation(), result.evidence(), ruleMs));

            switch (result.status()) {
                case pass -> {
                    pass++;
                    passedChecks.add(rule.id());
                }
                case warn -> {
                    warn++;
                    findings.add(toFinding(rule.id(), FindingSeverity.warn, result));
                }
                case fail -> {
                    fail++;
                    findings.add(toFinding(rule.id(), FindingSeverity.fail, result));
                }
                case skip -> skip++;
            }
        }

        CheckSummary summary = new CheckSummary(pass, warn, fail, skip, checks.size());
        DiffSummary diffSummary = DiffSummary.fromChangedFiles(changedFiles, changedLines);
        Verdict verdict = VerdictPolicy.fromChecks(checks);

        FeatureSpec spec = request.featureSpec();
        String repairPrompt = buildRepairPrompt(spec, findings);

        return new ReadinessReport(
                "1.0",
                Instant.now(),
                request.repoPath(),
                checkSuite,
                ENGINE_VERSION,
                null,
                durationMs,
                spec != null ? spec.id() : null,
                gitContext,
                verdict,
                diffSummary,
                summary,
                checks,
                findings,
                passedChecks,
                new TestResult(false, TestResultStatus.skip, null, null, null, null, null,
                        "Test execution not requested in this run"),
                repairPrompt);
    }

    private static Finding toFinding(String checkId, FindingSeverity severity, RuleResult result) {
        List<String> paths = result.evidence().stream()
                .filter(evidence -> evidence.kind() == EvidenceKind.file)
                .map(Evidence::path)
                .distinct()
                .toList();
        return new Finding(checkId, severity, result.message(), paths);
    }

    private static String buildRepairPrompt(FeatureSpec spec, List<Finding> findings) {
        StringBuilder builder = new StringBuilder();
        if (spec != null) {
            builder.append("Feature: ").append(spec.title()).append("\n\n");
        }
        if (findings.isEmpty()) {
            builder.append("All baseline checks passed. No blocking issues detected.");
            return builder.toString();
        }
        builder.append("Please address the following before committing:\n");
        for (Finding finding : findings) {
            builder.append("- [").append(finding.severity()).append("] ")
                    .append(finding.checkId()).append(": ").append(finding.message());
            if (finding.paths() != null && !finding.paths().isEmpty()) {
                builder.append(" (").append(String.join(", ", finding.paths())).append(")");
            }
            builder.append("\n");
        }
        builder.append("\nRe-run AgentReady after applying fixes.");
        return builder.toString();
    }
}
