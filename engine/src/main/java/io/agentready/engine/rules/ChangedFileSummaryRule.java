package io.agentready.engine.rules;

import io.agentready.engine.model.ChangedFile;
import io.agentready.engine.model.Evidence;
import io.agentready.engine.model.EvidenceKind;

import java.util.ArrayList;
import java.util.List;

/**
 * Always-pass informational rule listing the real changed files in the diff.
 */
public final class ChangedFileSummaryRule implements Rule {

    @Override
    public String id() {
        return "changed-file-summary";
    }

    @Override
    public String name() {
        return "Changed file summary";
    }

    @Override
    public RuleResult evaluate(RuleContext context) {
        List<ChangedFile> files = context.changedFiles();
        List<Evidence> evidence = new ArrayList<>();
        for (ChangedFile file : files) {
            evidence.add(new Evidence(
                    EvidenceKind.file, file.path(), file.changeType().name().toLowerCase()));
        }
        return RuleResult.pass(
                files.size() + " file(s) changed in the uncommitted diff", evidence);
    }
}
