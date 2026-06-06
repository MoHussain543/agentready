package io.agentready.engine.rules;

import io.agentready.engine.model.Evidence;
import io.agentready.engine.model.EvidenceKind;

import java.util.List;

/**
 * Warns when the diff is large by file count or changed-line count.
 */
public final class LargeDiffRule implements Rule {

    @Override
    public String id() {
        return "large-diff";
    }

    @Override
    public String name() {
        return "Large diff";
    }

    @Override
    public RuleResult evaluate(RuleContext context) {
        int files = context.changedFiles().size();
        int lines = context.totalChangedLines();
        int maxFiles = context.maxFiles();
        int maxLines = context.maxLines();

        if (files > maxFiles || lines > maxLines) {
            Evidence evidence = new Evidence(
                    EvidenceKind.note, "diff", files + " files, " + lines + " changed lines");
            return RuleResult.warn(
                    "Large diff: " + files + " files / " + lines + " changed lines exceeds "
                            + "thresholds (" + maxFiles + " files / " + maxLines + " lines)",
                    "Consider splitting this into smaller, focused commits.",
                    List.of(evidence));
        }
        return RuleResult.pass(
                "Diff size within thresholds (" + files + " files, " + lines + " lines)",
                List.of());
    }
}
