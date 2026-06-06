package io.agentready.engine.report;

import io.agentready.engine.model.FeatureSpec;
import io.agentready.engine.model.Finding;
import io.agentready.engine.model.TestResult;
import io.agentready.engine.model.TestResultStatus;
import io.agentready.engine.model.Verdict;

import java.util.ArrayList;
import java.util.List;

/**
 * Deterministic, template-based repair prompt generation. No external AI is used.
 *
 * <p>The output is compact and pasteable into Cursor/Claude: it pairs the original feature
 * request with the current verdict, concrete findings, optional test guidance, and explicit
 * guardrails (do not touch unrelated files).
 */
public final class RepairPromptBuilder {

    private static final String TEST_CHECK_ID = "tests";

    private RepairPromptBuilder() {}

    public static String build(
            FeatureSpec spec, Verdict verdict, List<Finding> findings, TestResult testResult) {

        String description = featureDescription(spec);
        List<Finding> issues = new ArrayList<>();
        for (Finding finding : findings) {
            if (!TEST_CHECK_ID.equals(finding.checkId())) {
                issues.add(finding);
            }
        }
        List<String> testGuidance = testGuidance(testResult);

        // Ready and clean: keep it minimal but preserve a consistent shape.
        if (verdict == Verdict.READY_TO_COMMIT && issues.isEmpty() && testGuidance.isEmpty()) {
            StringBuilder builder = new StringBuilder();
            builder.append("AgentReady verdict: ").append(verdict).append("\n");
            builder.append(VerdictPolicy.explain(verdict)).append("\n");
            if (description != null) {
                builder.append("\nFeature request:\n").append(description).append("\n");
            }
            return builder.toString().strip();
        }

        StringBuilder builder = new StringBuilder();
        builder.append("Review the current git diff against this feature request:\n");
        builder.append(description != null ? description : "(no feature description provided)")
                .append("\n\n");
        builder.append("AgentReady verdict: ").append(verdict).append("\n");
        builder.append(VerdictPolicy.explain(verdict)).append("\n");

        if (!issues.isEmpty()) {
            builder.append("\nFix these issues:\n");
            for (Finding finding : issues) {
                builder.append("- ").append(finding.message());
                if (finding.paths() != null && !finding.paths().isEmpty()) {
                    builder.append(" (").append(String.join(", ", finding.paths())).append(")");
                }
                builder.append("\n");
            }
        }

        if (!testGuidance.isEmpty()) {
            builder.append("\nTests:\n");
            for (String line : testGuidance) {
                builder.append("- ").append(line).append("\n");
            }
        }

        builder.append("\nRequirements:\n");
        builder.append("- Do not change unrelated files\n");
        builder.append("- Keep the implementation aligned with the original request\n");
        builder.append("- Re-run AgentReady and make sure the checks pass\n");
        if (hasCommand(testResult)) {
            builder.append("- Re-run the test command and make sure it passes\n");
        }
        return builder.toString().strip();
    }

    private static String featureDescription(FeatureSpec spec) {
        if (spec == null) {
            return null;
        }
        if (spec.originalFeatureDescription() != null
                && !spec.originalFeatureDescription().isBlank()) {
            return spec.originalFeatureDescription().strip();
        }
        if (spec.title() != null && !spec.title().isBlank()) {
            return spec.title().strip();
        }
        return null;
    }

    private static List<String> testGuidance(TestResult testResult) {
        List<String> guidance = new ArrayList<>();
        if (testResult == null) {
            return guidance;
        }
        TestResultStatus status = testResult.status();
        if (status == TestResultStatus.fail) {
            String command = hasCommand(testResult) ? " (" + testResult.command() + ")" : "";
            guidance.add("The test suite is currently failing" + command
                    + "; make the test command pass before committing.");
        } else if (status == TestResultStatus.error) {
            guidance.add("The configured test command could not be executed; verify it and "
                    + "re-run before committing.");
        } else if (status == TestResultStatus.warn && !testResult.ran()) {
            guidance.add("Tests were requested but no test command is configured; configure a "
                    + "test command and run it.");
        }
        return guidance;
    }

    private static boolean hasCommand(TestResult testResult) {
        return testResult != null
                && testResult.command() != null
                && !testResult.command().isBlank();
    }
}
