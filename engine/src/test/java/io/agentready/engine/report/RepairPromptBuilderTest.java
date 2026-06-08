package io.agentready.engine.report;

import io.agentready.engine.model.FeatureSpec;
import io.agentready.engine.model.Finding;
import io.agentready.engine.model.FindingSeverity;
import io.agentready.engine.model.TestResult;
import io.agentready.engine.model.TestResultStatus;
import io.agentready.engine.model.Verdict;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RepairPromptBuilderTest {

    private static FeatureSpec spec(String description) {
        return new FeatureSpec(
                "1.0", UUID.randomUUID(), "Demo feature", description,
                List.of(), List.of(), List.of(), Instant.now(), Instant.now());
    }

    private static TestResult notRun() {
        return new TestResult(false, TestResultStatus.skip, null, null, null, null, null, "Not run");
    }

    @Test
    void notReadyPromptListsFeatureVerdictAndFindings() {
        List<Finding> findings = List.of(
                new Finding("status-code-match", FindingSeverity.fail,
                        "None of the expected status codes (410) were found in the diff",
                        List.of()),
                new Finding("config-env-dependency-risk", FindingSeverity.warn,
                        "1 sensitive non-application file(s) changed", List.of("package.json")));

        String prompt = RepairPromptBuilder.build(
                spec("Handle 410 for retired endpoints"), Verdict.NOT_READY, findings, notRun());

        assertTrue(prompt.contains("Handle 410 for retired endpoints"));
        assertTrue(prompt.contains("AgentReady verdict: NOT_READY"));
        assertTrue(prompt.contains("410"));
        assertTrue(prompt.contains("package.json"));
        assertTrue(prompt.contains("Do not change unrelated files"));
    }

    @Test
    void failingTestsAddTestGuidanceAndReRunRequirement() {
        TestResult failing = new TestResult(
                true, TestResultStatus.fail, "mvn test", 1, 500, "boom", null,
                "Tests failed with exit code 1");

        String prompt = RepairPromptBuilder.build(
                spec("Add caching"), Verdict.NOT_READY, List.of(), failing);

        assertTrue(prompt.contains("Tests:"));
        assertTrue(prompt.contains("mvn test"));
        assertTrue(prompt.contains("Re-run the test command"));
    }

    @Test
    void missingCommandWhenRequestedSurfacesGuidance() {
        TestResult noCommand = new TestResult(
                false, TestResultStatus.warn, null, null, null, null, null,
                "Tests were requested but no test command is configured");

        String prompt = RepairPromptBuilder.build(
                spec("Add caching"), Verdict.NEEDS_REVIEW, List.of(), noCommand);

        assertTrue(prompt.toLowerCase().contains("no test command is configured"));
    }

    @Test
    void warningOnlyPromptUsesReviewLanguage() {
        List<Finding> findings = List.of(
                new Finding("feature-alignment-drift", FindingSeverity.warn,
                        "1 changed production file(s) may be unrelated to the requested feature",
                        List.of("src/SettingsModal.tsx")));

        String prompt = RepairPromptBuilder.build(
                spec("Open saved reports from recent projects"), Verdict.NEEDS_REVIEW, findings, notRun());

        assertTrue(prompt.contains("Review these issues:"));
        assertFalse(prompt.contains("Fix these issues:"));
    }

    @Test
    void readyAndCleanPromptIsMinimal() {
        String prompt = RepairPromptBuilder.build(
                spec("Add caching"), Verdict.READY_TO_COMMIT, List.of(), notRun());

        assertTrue(prompt.contains("AgentReady verdict: READY_TO_COMMIT"));
        assertFalse(prompt.contains("Fix these issues:"));
    }
}
