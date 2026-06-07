package io.agentready.engine.rules;

import io.agentready.engine.model.ChangedFile;
import io.agentready.engine.model.Evidence;
import io.agentready.engine.model.EvidenceKind;

import java.util.ArrayList;
import java.util.List;

/**
 * Warns when production source files changed but no likely test files were touched.
 *
 * <p>Skips the warning for tiny, low-risk diffs (see {@link DiffProfile#isTinyLowRisk()})
 * because a sub-25-line edit to 1–3 non-sensitive files (UI copy, a doc comment, etc.)
 * produces more noise than signal. The warning is preserved for any diff that exceeds
 * those thresholds or touches a risky path.
 */
public final class ProductionWithoutTestsRule implements Rule {

    @Override
    public String id() {
        return "production-without-tests";
    }

    @Override
    public String name() {
        return "Production changes without tests";
    }

    @Override
    public RuleResult evaluate(RuleContext context) {
        DiffProfile profile = context.diffProfile();
        List<ChangedFile> production = profile.productionFiles();

        if (production.isEmpty()) {
            return RuleResult.skip("No production source files changed");
        }

        boolean testsChanged = context.changedFiles().stream()
                .anyMatch(f -> context.classifier().isTestFile(f.path()));
        if (testsChanged) {
            return RuleResult.pass("Production and test files changed together", List.of());
        }

        if (profile.isTinyLowRisk()) {
            return RuleResult.skip(
                    "Tiny diff (" + production.size() + " file(s), "
                            + context.totalChangedLines() + " lines): test coverage signal skipped");
        }

        List<Evidence> evidence = new ArrayList<>();
        for (ChangedFile file : production) {
            evidence.add(new Evidence(EvidenceKind.file, file.path(), "production source"));
        }
        return RuleResult.warn(
                production.size() + " production file(s) changed with no test changes",
                "Add or update tests covering these changes before committing.",
                evidence);
    }
}
