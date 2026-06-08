package io.agentready.engine.rules;

import io.agentready.engine.model.ChangedFile;
import io.agentready.engine.model.Evidence;
import io.agentready.engine.model.EvidenceKind;
import io.agentready.engine.model.FeatureSpec;
import io.agentready.engine.spec.SpecMatcher;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Looks for changed production files or added UI copy that weakly overlap with the requested
 * feature, even when the overall diff still hits enough keywords globally.
 */
public final class FeatureAlignmentDriftRule implements Rule {

    private static final int MIN_KEYWORDS_FOR_DRIFT_CHECK = 3;
    private static final Set<String> UI_DRIFT_TERMS = Set.of(
            "settings", "help", "profile", "account", "billing", "login", "logout", "signup",
            "password", "dashboard", "analytics", "export", "import");

    @Override
    public String id() {
        return "feature-alignment-drift";
    }

    @Override
    public String name() {
        return "Feature alignment drift";
    }

    @Override
    public RuleResult evaluate(RuleContext context) {
        FeatureSpec spec = context.featureSpec();
        if (spec == null || spec.expectedKeywords().size() < MIN_KEYWORDS_FOR_DRIFT_CHECK) {
            return RuleResult.skip("Feature spec is too small for file-level drift detection");
        }

        int matchedFiles = 0;
        List<Evidence> evidence = new ArrayList<>();

        for (ChangedFile file : context.diffProfile().productionFiles()) {
            String fileCorpus = context.fileCorpus(file.path());
            int matchedKeywords = 0;
            for (String keyword : spec.expectedKeywords()) {
                if (SpecMatcher.containsKeyword(fileCorpus, keyword)) {
                    matchedKeywords++;
                }
            }
            if (matchedKeywords > 0) {
                matchedFiles++;
            }

            Set<String> driftTerms = unexpectedUiTerms(context.addedLines(file.path()), spec.expectedKeywords());
            if (!driftTerms.isEmpty()) {
                evidence.add(new Evidence(
                        EvidenceKind.file,
                        file.path(),
                        "unexpected UI term(s): " + String.join(", ", driftTerms)));
                continue;
            }

            if (matchedKeywords == 0) {
                evidence.add(new Evidence(EvidenceKind.file, file.path(), "weak overlap with feature request"));
            }
        }

        if (evidence.isEmpty() || matchedFiles == 0) {
            return RuleResult.pass("Changed production files broadly align with the feature request", List.of());
        }
        return RuleResult.warn(
                evidence.size() + " changed production file(s) look weakly related to the feature request",
                "Remove unrelated edits or update the feature description if the broader scope is intentional.",
                evidence);
    }

    private static Set<String> unexpectedUiTerms(List<String> lines, List<String> expectedKeywords) {
        Set<String> hits = new LinkedHashSet<>();
        for (String line : lines) {
            String lower = line.toLowerCase(Locale.ROOT);
            for (String term : UI_DRIFT_TERMS) {
                if (lower.contains(term) && !expectedKeywords.contains(term)) {
                    hits.add(term);
                }
            }
        }
        return hits;
    }
}
