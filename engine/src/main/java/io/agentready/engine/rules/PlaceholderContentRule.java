package io.agentready.engine.rules;

import io.agentready.engine.model.ChangedFile;
import io.agentready.engine.model.Evidence;
import io.agentready.engine.model.EvidenceKind;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Warns when added production content looks intentionally unfinished.
 */
public final class PlaceholderContentRule implements Rule {

    private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile(
            "\\b(todo|tbd|coming soon|not implemented|placeholder|stub|temporary|for now)\\b");

    @Override
    public String id() {
        return "placeholder-content";
    }

    @Override
    public String name() {
        return "Placeholder / unfinished content";
    }

    @Override
    public RuleResult evaluate(RuleContext context) {
        List<Evidence> evidence = new ArrayList<>();
        for (ChangedFile file : context.diffProfile().productionFiles()) {
            for (String line : context.addedLines(file.path())) {
                String lower = line.toLowerCase(Locale.ROOT);
                java.util.regex.Matcher matcher = PLACEHOLDER_PATTERN.matcher(lower);
                if (matcher.find()) {
                    evidence.add(new Evidence(EvidenceKind.file, file.path(), matcher.group(1)));
                    break;
                }
            }
        }

        if (evidence.isEmpty()) {
            return RuleResult.pass("No obvious placeholder or unfinished content in added production lines", List.of());
        }
        if (evidence.size() == 1) {
            Evidence hit = evidence.get(0);
            return RuleResult.warn(
                    "Placeholder-style or unfinished content found: " + hit.detail(),
                    "Replace placeholder copy or comments before committing.",
                    evidence);
        }
        return RuleResult.warn(
                evidence.size() + " file(s) contain placeholder-style or unfinished content",
                "Replace placeholder copy or comments before committing.",
                evidence);
    }
}
