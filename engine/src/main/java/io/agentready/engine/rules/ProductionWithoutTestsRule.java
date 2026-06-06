package io.agentready.engine.rules;

import io.agentready.engine.diff.FileClassifier;
import io.agentready.engine.model.ChangedFile;
import io.agentready.engine.model.Evidence;
import io.agentready.engine.model.EvidenceKind;

import java.util.ArrayList;
import java.util.List;

/**
 * Warns when production source files changed but no likely test files were touched.
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
        FileClassifier classifier = context.classifier();

        List<ChangedFile> production = new ArrayList<>();
        boolean testsChanged = false;
        for (ChangedFile file : context.changedFiles()) {
            if (classifier.isTestFile(file.path())) {
                testsChanged = true;
            } else if (classifier.isProductionSource(file.path())) {
                production.add(file);
            }
        }

        if (production.isEmpty()) {
            return RuleResult.skip("No production source files changed");
        }
        if (testsChanged) {
            return RuleResult.pass(
                    "Production and test files changed together", List.of());
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
