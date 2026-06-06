package io.agentready.engine.cli;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.agentready.engine.exec.TestRunner;
import io.agentready.engine.git.GitService;
import io.agentready.engine.json.JsonMapperFactory;
import io.agentready.engine.model.ChangeType;
import io.agentready.engine.model.ChangedFile;
import io.agentready.engine.model.CheckResult;
import io.agentready.engine.model.CheckStatus;
import io.agentready.engine.model.EngineOptions;
import io.agentready.engine.model.EngineRequest;
import io.agentready.engine.model.EngineResponse;
import io.agentready.engine.model.FeatureSpec;
import io.agentready.engine.model.ReadinessReport;
import io.agentready.engine.model.TestResult;
import io.agentready.engine.model.TestResultStatus;
import io.agentready.engine.model.Verdict;
import org.junit.jupiter.api.Test;

import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ReadinessRunnerTest {

    private final ObjectMapper mapper = JsonMapperFactory.create();

    /** GitService stub so runner + rule logic can be tested without a real repository. */
    private static final class FakeGitService extends GitService {
        private boolean isRepo = true;
        private List<ChangedFile> files = List.of();
        private GitContextValues context = new GitContextValues();
        private int changedLines = 10;
        private Map<String, Integer> changedLineCounts = Map.of();
        private Map<String, List<String>> addedLines = Map.of();

        @Override
        public boolean isGitRepository(Path repo) {
            return isRepo;
        }

        @Override
        public List<ChangedFile> changedFiles(Path repo) {
            return files;
        }

        @Override
        public io.agentready.engine.model.GitContext readGitContext(
                Path repo, List<ChangedFile> changedFiles) {
            return new io.agentready.engine.model.GitContext(
                    context.branch, context.sha, context.dirty, context.staged, context.unstaged);
        }

        @Override
        public int changedLineCount(Path repo) {
            return changedLines;
        }

        @Override
        public Map<String, Integer> changedLineCounts(Path repo) {
            if (!changedLineCounts.isEmpty()) {
                return changedLineCounts;
            }
            return files.stream().collect(java.util.stream.Collectors.toMap(
                    ChangedFile::path,
                    file -> changedLines,
                    (left, right) -> left));
        }

        @Override
        public Map<String, List<String>> addedLinesByPath(Path repo) {
            return addedLines;
        }
    }

    private static final class GitContextValues {
        String branch = "main";
        String sha = "abc1234";
        boolean dirty = true;
        int staged = 1;
        int unstaged = 0;
    }

    private static EngineRequest request(String repoPath, EngineOptions options) {
        return request(repoPath, options, null);
    }

    private static EngineRequest request(String repoPath, EngineOptions options, FeatureSpec spec) {
        return new EngineRequest("1.0", "run_readiness", repoPath, spec, options);
    }

    private static FeatureSpec spec(
            List<String> keywords, List<Integer> statusCodes, List<String> riskKeywords) {
        return new FeatureSpec(
                "1.0", UUID.randomUUID(), "Test feature", "A test feature description",
                keywords, statusCodes, riskKeywords, Instant.now(), Instant.now());
    }

    private static EngineOptions runTestsOptions(String command) {
        return new EngineOptions(null, null, null, null, null, true, command);
    }

    private static TestRunner fixedRunner(TestResult result) {
        return new TestRunner() {
            @Override
            public TestResult run(Path repo, String command) {
                return result;
            }
        };
    }

    /** Repo with a production file and a test file, so only test-execution drives the verdict. */
    private static FakeGitService gitWithTestedChange() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(
                new ChangedFile("src/App.java", ChangeType.MODIFIED),
                new ChangedFile("src/AppTest.java", ChangeType.MODIFIED));
        return git;
    }

    private static CheckResult check(ReadinessReport report, String id) {
        return report.checks().stream()
                .filter(c -> c.id().equals(id))
                .findFirst()
                .orElseThrow(() -> new AssertionError("missing check: " + id));
    }

    @Test
    void changedFileSummaryReflectsRealDiff() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(
                new ChangedFile("src/App.java", ChangeType.MODIFIED),
                new ChangedFile("src/AppTest.java", ChangeType.ADDED));

        EngineResponse response = new ReadinessRunner(git).handle(request("/tmp/repo", null));
        ReadinessReport report = response.report();

        assertEquals("ok", response.status());
        assertEquals(2, report.diffSummary().totalFiles());
        assertEquals(CheckStatus.pass, check(report, "changed-file-summary").status());
    }

    @Test
    void productionWithoutTestsWarns() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(new ChangedFile("src/main/App.java", ChangeType.MODIFIED));

        ReadinessReport report = new ReadinessRunner(git).handle(request("/tmp/repo", null)).report();

        assertEquals(CheckStatus.warn, check(report, "production-without-tests").status());
        assertEquals(Verdict.NEEDS_REVIEW, report.verdict());
        assertTrue(report.findings().stream()
                .anyMatch(f -> f.checkId().equals("production-without-tests")
                        && f.paths().contains("src/main/App.java")));
    }

    @Test
    void productionWithTestsPasses() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(
                new ChangedFile("src/App.java", ChangeType.MODIFIED),
                new ChangedFile("src/AppTest.java", ChangeType.ADDED));

        ReadinessReport report = new ReadinessRunner(git).handle(request("/tmp/repo", null)).report();

        assertEquals(CheckStatus.pass, check(report, "production-without-tests").status());
        assertEquals(Verdict.READY_TO_COMMIT, report.verdict());
        assertTrue(report.passedChecks().contains("production-without-tests"));
    }

    @Test
    void deletedTestFilesFailAndDriveNotReady() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(new ChangedFile("src/test/AppTest.java", ChangeType.DELETED));

        ReadinessReport report = new ReadinessRunner(git).handle(request("/tmp/repo", null)).report();

        assertEquals(CheckStatus.fail, check(report, "deleted-test-files").status());
        assertEquals(Verdict.NOT_READY, report.verdict());
    }

    @Test
    void largeDiffWarnsWhenOverThreshold() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(
                new ChangedFile("a.java", ChangeType.MODIFIED),
                new ChangedFile("b.java", ChangeType.MODIFIED),
                new ChangedFile("AppTest.java", ChangeType.ADDED));
        EngineOptions options = new EngineOptions("free-v1-precommit", 1, 1, true, true, false, null);

        ReadinessReport report =
                new ReadinessRunner(git).handle(request("/tmp/repo", options)).report();

        assertEquals(CheckStatus.warn, check(report, "large-diff").status());
    }

    @Test
    void configDependencyChangesWarn() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(
                new ChangedFile("package.json", ChangeType.MODIFIED),
                new ChangedFile("AppTest.java", ChangeType.ADDED));

        ReadinessReport report = new ReadinessRunner(git).handle(request("/tmp/repo", null)).report();

        assertEquals(CheckStatus.warn, check(report, "config-env-dependency-risk").status());
    }

    @Test
    void riskyPathChangesWarn() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(
                new ChangedFile("src/auth/session_store.go", ChangeType.MODIFIED),
                new ChangedFile("src/auth/session_store_test.go", ChangeType.MODIFIED));

        ReadinessReport report = new ReadinessRunner(git).handle(request("/tmp/repo", null)).report();

        assertEquals(CheckStatus.warn, check(report, "config-env-dependency-risk").status());
        assertTrue(report.findings().stream()
                .anyMatch(f -> f.checkId().equals("config-env-dependency-risk")
                        && f.paths().contains("src/auth/session_store.go")));
    }

    @Test
    void hardcodedSecretsWarn() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(new ChangedFile("src/Config.java", ChangeType.MODIFIED));
        git.addedLines = Map.of(
                "src/Config.java",
                List.of("String apiKey = \"AKIA1234567890ABCDEFGH\";"));

        ReadinessReport report = new ReadinessRunner(git).handle(request("/tmp/repo", null)).report();

        assertEquals(CheckStatus.warn, check(report, "hardcoded-secrets").status());
        assertTrue(report.findings().stream()
                .anyMatch(f -> f.checkId().equals("hardcoded-secrets")
                        && f.paths().contains("src/Config.java")));
    }

    @Test
    void cleanDiffIsReadyToCommit() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(
                new ChangedFile("src/App.java", ChangeType.MODIFIED),
                new ChangedFile("src/AppTest.java", ChangeType.MODIFIED));

        ReadinessReport report = new ReadinessRunner(git).handle(request("/tmp/repo", null)).report();

        assertEquals(Verdict.READY_TO_COMMIT, report.verdict());
        assertEquals(0, report.summary().fail());
        assertEquals(0, report.summary().warn());
        assertTrue(report.findings().isEmpty());
    }

    @Test
    void returnsNoDiffErrorWhenNoChanges() {
        FakeGitService git = new FakeGitService();
        git.files = List.of();

        EngineResponse response = new ReadinessRunner(git).handle(request("/tmp/repo", null));

        assertEquals("error", response.status());
        assertEquals("NO_DIFF", response.error().code());
        assertNull(response.report());
    }

    @Test
    void returnsNoDiffWhenOnlyInternalAgentReadyFilesChanged() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(
                new ChangedFile(".agentready/session.json", ChangeType.MODIFIED),
                new ChangedFile(".agentready/feature-spec.json", ChangeType.MODIFIED));

        EngineResponse response = new ReadinessRunner(git).handle(request("/tmp/repo", null));

        assertEquals("error", response.status());
        assertEquals("NO_DIFF", response.error().code());
    }

    @Test
    void ignoresInternalFilesInReadinessAnalysis() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(
                new ChangedFile(".agentready/session.json", ChangeType.MODIFIED),
                new ChangedFile("src/main/App.java", ChangeType.MODIFIED));
        git.changedLineCounts = Map.of(
                ".agentready/session.json", 4000,
                "src/main/App.java", 25);

        ReadinessReport report = new ReadinessRunner(git).handle(request("/tmp/repo", null)).report();

        assertEquals(1, report.diffSummary().totalFiles());
        assertEquals(25, report.diffSummary().totalChangedLines());
        assertEquals(CheckStatus.pass, check(report, "config-env-dependency-risk").status());
    }

    @Test
    void generatedTauriArtifactsDoNotDriveRiskOrLargeDiffWarnings() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(
                new ChangedFile("apps/desktop/src-tauri/gen/schemas/desktop-schema.json", ChangeType.ADDED),
                new ChangedFile("src/main/App.java", ChangeType.MODIFIED),
                new ChangedFile("src/test/AppTest.java", ChangeType.MODIFIED));
        git.changedLineCounts = Map.of(
                "apps/desktop/src-tauri/gen/schemas/desktop-schema.json", 9000,
                "src/main/App.java", 40,
                "src/test/AppTest.java", 12);

        ReadinessReport report = new ReadinessRunner(git).handle(request("/tmp/repo", null)).report();

        assertEquals(2, report.diffSummary().totalFiles());
        assertEquals(52, report.diffSummary().totalChangedLines());
        assertEquals(CheckStatus.pass, check(report, "config-env-dependency-risk").status());
        assertEquals(CheckStatus.pass, check(report, "large-diff").status());
    }

    @Test
    void returnsInvalidRepoWhenNotGitRepository() {
        FakeGitService git = new FakeGitService();
        git.isRepo = false;

        EngineResponse response = new ReadinessRunner(git).handle(request("/tmp/repo", null));

        assertEquals("error", response.status());
        assertEquals("INVALID_REPO", response.error().code());
    }

    @Test
    void returnsErrorForUnknownCommand() throws Exception {
        EngineResponse response = mapper.readValue(
                new EngineRunner().handleJson("""
                        {"protocolVersion":"1.0","command":"ping","repoPath":"/tmp/repo"}
                        """),
                EngineResponse.class);

        assertEquals("error", response.status());
        assertEquals("UNKNOWN_COMMAND", response.error().code());
    }

    @Test
    void returnsErrorForInvalidJson() throws Exception {
        EngineResponse response =
                mapper.readValue(new EngineRunner().handleJson("{not-json"), EngineResponse.class);

        assertEquals("error", response.status());
        assertEquals("INVALID_JSON", response.error().code());
    }

    @Test
    void returnsStructuredInternalErrorWhenHandlerThrows() throws Exception {
        EngineRunner failingRunner = new EngineRunner(
                JsonMapperFactory.create(),
                req -> {
                    throw new IllegalStateException("boom");
                });

        EngineResponse response = mapper.readValue(
                failingRunner.handleJson("""
                        {"protocolVersion":"1.0","command":"run_readiness","repoPath":"/tmp/repo"}
                        """),
                EngineResponse.class);

        assertEquals("error", response.status());
        assertEquals("INTERNAL", response.error().code());
    }

    @Test
    void specAwareChecksSkipWhenNoSpec() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(new ChangedFile("src/App.java", ChangeType.MODIFIED));

        ReadinessReport report = new ReadinessRunner(git).handle(request("/tmp/repo", null)).report();

        assertEquals(CheckStatus.skip, check(report, "spec-keyword-match").status());
        assertEquals(CheckStatus.skip, check(report, "status-code-match").status());
        assertEquals(CheckStatus.skip, check(report, "risk-keyword-presence").status());
    }

    @Test
    void matchingStatusCodePasses() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(new ChangedFile("src/Handler.java", ChangeType.MODIFIED));
        git.addedLines = Map.of(
                "src/Handler.java", List.of("return ResponseEntity.status(404).build();"));
        FeatureSpec spec = spec(List.of(), List.of(404), List.of());

        ReadinessReport report =
                new ReadinessRunner(git).handle(request("/tmp/repo", null, spec)).report();

        assertEquals(CheckStatus.pass, check(report, "status-code-match").status());
    }

    @Test
    void missingStatusCodeFailsAndDrivesNotReady() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(new ChangedFile("src/Handler.java", ChangeType.MODIFIED));
        git.addedLines = Map.of("src/Handler.java", List.of("return ok();"));
        FeatureSpec spec = spec(List.of(), List.of(410), List.of());

        ReadinessReport report =
                new ReadinessRunner(git).handle(request("/tmp/repo", null, spec)).report();

        assertEquals(CheckStatus.fail, check(report, "status-code-match").status());
        assertEquals(Verdict.NOT_READY, report.verdict());
        assertTrue(report.findings().stream()
                .anyMatch(f -> f.checkId().equals("status-code-match")
                        && f.message().contains("410")));
    }

    @Test
    void keywordCoverageStrongPasses() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(new ChangedFile("src/checkout/PaymentCart.java", ChangeType.MODIFIED));
        FeatureSpec spec = spec(List.of("checkout", "payment", "cart"), List.of(), List.of());

        ReadinessReport report =
                new ReadinessRunner(git).handle(request("/tmp/repo", null, spec)).report();

        assertEquals(CheckStatus.pass, check(report, "spec-keyword-match").status());
        assertTrue(report.passedChecks().contains("spec-keyword-match"));
    }

    @Test
    void keywordCoveragePartialWarns() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(new ChangedFile("src/checkout/Handler.java", ChangeType.MODIFIED));
        FeatureSpec spec = spec(List.of("checkout", "refund", "invoice"), List.of(), List.of());

        ReadinessReport report =
                new ReadinessRunner(git).handle(request("/tmp/repo", null, spec)).report();

        assertEquals(CheckStatus.warn, check(report, "spec-keyword-match").status());
    }

    @Test
    void keywordCoverageAbsentFromStrongSpecFails() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(new ChangedFile("src/App.java", ChangeType.MODIFIED));
        FeatureSpec spec = spec(List.of("alpha", "beta", "gamma"), List.of(), List.of());

        ReadinessReport report =
                new ReadinessRunner(git).handle(request("/tmp/repo", null, spec)).report();

        assertEquals(CheckStatus.fail, check(report, "spec-keyword-match").status());
        assertEquals(Verdict.NOT_READY, report.verdict());
    }

    @Test
    void riskKeywordAbsentWarns() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(
                new ChangedFile("src/App.java", ChangeType.MODIFIED),
                new ChangedFile("src/AppTest.java", ChangeType.MODIFIED));
        FeatureSpec spec = spec(List.of(), List.of(), List.of("payment"));

        ReadinessReport report =
                new ReadinessRunner(git).handle(request("/tmp/repo", null, spec)).report();

        assertEquals(CheckStatus.warn, check(report, "risk-keyword-presence").status());
    }

    @Test
    void riskKeywordPresentPasses() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(new ChangedFile("src/payment/Charge.java", ChangeType.MODIFIED));
        FeatureSpec spec = spec(List.of(), List.of(), List.of("payment"));

        ReadinessReport report =
                new ReadinessRunner(git).handle(request("/tmp/repo", null, spec)).report();

        assertEquals(CheckStatus.pass, check(report, "risk-keyword-presence").status());
    }

    @Test
    void testsNotRequestedStaySkipped() {
        ReadinessReport report =
                new ReadinessRunner(gitWithTestedChange()).handle(request("/tmp/repo", null)).report();

        assertFalse(report.testResult().ran());
        assertEquals(TestResultStatus.skip, report.testResult().status());
        assertTrue(report.checks().stream().noneMatch(c -> c.id().equals("tests")));
    }

    @Test
    void testsRequestedPassingIncludesPassResult() {
        TestRunner runner = fixedRunner(new TestResult(
                true, TestResultStatus.pass, "mvn test", 0, 1200, "BUILD SUCCESS", null,
                "Tests passed"));

        ReadinessReport report = new ReadinessRunner(gitWithTestedChange(), runner)
                .handle(request("/tmp/repo", runTestsOptions("mvn test"))).report();

        assertTrue(report.testResult().ran());
        assertEquals(TestResultStatus.pass, report.testResult().status());
        assertEquals("mvn test", report.testResult().command());
        assertEquals(CheckStatus.pass, check(report, "tests").status());
        assertEquals(Verdict.READY_TO_COMMIT, report.verdict());
    }

    @Test
    void testsRequestedFailingDrivesNotReady() {
        TestRunner runner = fixedRunner(new TestResult(
                true, TestResultStatus.fail, "npm test", 1, 800, "1 test failed", null,
                "Tests failed with exit code 1"));

        ReadinessReport report = new ReadinessRunner(gitWithTestedChange(), runner)
                .handle(request("/tmp/repo", runTestsOptions("npm test"))).report();

        assertEquals(TestResultStatus.fail, report.testResult().status());
        assertEquals(CheckStatus.fail, check(report, "tests").status());
        assertEquals(Verdict.NOT_READY, report.verdict());
    }

    @Test
    void testsRequestedWithoutCommandSurfacesWarning() {
        ReadinessReport report = new ReadinessRunner(gitWithTestedChange())
                .handle(request("/tmp/repo", runTestsOptions(null))).report();

        assertFalse(report.testResult().ran());
        assertEquals(TestResultStatus.warn, report.testResult().status());
        assertNull(report.testResult().command());
        assertEquals(CheckStatus.warn, check(report, "tests").status());
        assertEquals(Verdict.NEEDS_REVIEW, report.verdict());
    }

    @Test
    void testProcessErrorSurfacesAsWarning() {
        TestRunner runner = fixedRunner(new TestResult(
                true, TestResultStatus.error, "bogus-cmd", null, 5, null, null,
                "Could not start test command"));

        ReadinessReport report = new ReadinessRunner(gitWithTestedChange(), runner)
                .handle(request("/tmp/repo", runTestsOptions("bogus-cmd"))).report();

        assertEquals(TestResultStatus.error, report.testResult().status());
        assertEquals(CheckStatus.warn, check(report, "tests").status());
        assertEquals(Verdict.NEEDS_REVIEW, report.verdict());
    }

    @Test
    void verdictExplanationForReadyToCommit() {
        ReadinessReport report = new ReadinessRunner(gitWithTestedChange())
                .handle(request("/tmp/repo", null)).report();

        assertEquals(Verdict.READY_TO_COMMIT, report.verdict());
        assertEquals(
                "The current diff passed the baseline readiness checks.",
                report.verdictExplanation());
    }

    @Test
    void verdictExplanationForNeedsReview() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(new ChangedFile("src/main/App.java", ChangeType.MODIFIED));

        ReadinessReport report = new ReadinessRunner(git).handle(request("/tmp/repo", null)).report();

        assertEquals(Verdict.NEEDS_REVIEW, report.verdict());
        assertEquals(
                "No blocking issues were found, but some changes need review.",
                report.verdictExplanation());
    }

    @Test
    void verdictExplanationForNotReady() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(new ChangedFile("src/test/AppTest.java", ChangeType.DELETED));

        ReadinessReport report = new ReadinessRunner(git).handle(request("/tmp/repo", null)).report();

        assertEquals(Verdict.NOT_READY, report.verdict());
        assertEquals(
                "Blocking issues were found in the current diff.", report.verdictExplanation());
    }

    @Test
    void repairPromptIncludesFeatureDescriptionAndFindings() {
        FakeGitService git = new FakeGitService();
        git.files = List.of(new ChangedFile("src/main/App.java", ChangeType.MODIFIED));
        FeatureSpec spec = spec(List.of(), List.of(), List.of());

        ReadinessReport report = new ReadinessRunner(git)
                .handle(request("/tmp/repo", null, spec)).report();

        String prompt = report.repairPrompt();
        assertTrue(prompt.contains("A test feature description"));
        assertTrue(prompt.contains("AgentReady verdict: NEEDS_REVIEW"));
        assertTrue(prompt.contains("Fix these issues:"));
        assertTrue(prompt.contains("Do not change unrelated files"));
    }

    @Test
    void repairPromptIncludesTestGuidanceWhenTestsFail() {
        TestRunner runner = fixedRunner(new TestResult(
                true, TestResultStatus.fail, "npm test", 1, 800, "1 test failed", null,
                "Tests failed with exit code 1"));

        ReadinessReport report = new ReadinessRunner(gitWithTestedChange(), runner)
                .handle(request("/tmp/repo", runTestsOptions("npm test"))).report();

        String prompt = report.repairPrompt();
        assertTrue(prompt.contains("Tests:"));
        assertTrue(prompt.toLowerCase().contains("failing"));
        assertTrue(prompt.contains("npm test"));
    }

    @Test
    void repairPromptIsMinimalWhenReady() {
        ReadinessReport report = new ReadinessRunner(gitWithTestedChange())
                .handle(request("/tmp/repo", null)).report();

        String prompt = report.repairPrompt();
        assertTrue(prompt.contains("AgentReady verdict: READY_TO_COMMIT"));
        assertFalse(prompt.contains("Fix these issues:"));
    }

    @Test
    void reportSerializesToJson() throws Exception {
        FakeGitService git = new FakeGitService();
        git.files = List.of(new ChangedFile("src/App.java", ChangeType.MODIFIED));

        ReadinessReport report = new ReadinessRunner(git).handle(request("/tmp/repo", null)).report();
        String json = mapper.writeValueAsString(report);

        assertNotNull(json);
        assertTrue(json.contains("\"verdict\""));
        assertTrue(json.contains("\"checks\""));
    }
}
