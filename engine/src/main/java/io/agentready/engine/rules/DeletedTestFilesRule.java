package io.agentready.engine.rules;

import io.agentready.engine.model.ChangeType;
import io.agentready.engine.model.ChangedFile;
import io.agentready.engine.model.Evidence;
import io.agentready.engine.model.EvidenceKind;

import java.util.ArrayList;
import java.util.List;

/**
 * Fails when a likely test file is deleted in the diff.
 */
public final class DeletedTestFilesRule implements Rule {

    @Override
    public String id() {
        return "deleted-test-files";
    }

    @Override
    public String name() {
        return "Deleted test files";
    }

    @Override
    public RuleResult evaluate(RuleContext context) {
        List<Evidence> deleted = new ArrayList<>();
        for (ChangedFile file : context.changedFiles()) {
            if (file.changeType() == ChangeType.DELETED
                    && context.classifier().isTestFile(file.path())) {
                deleted.add(new Evidence(EvidenceKind.file, file.path(), "deleted test"));
            }
        }

        if (deleted.isEmpty()) {
            return RuleResult.pass("No test files were deleted", List.of());
        }
        return RuleResult.fail(
                deleted.size() + " test file(s) deleted in this diff",
                "Restore the deleted tests or justify their removal before committing.",
                deleted);
    }
}
