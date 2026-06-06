package io.agentready.engine.rules;

import io.agentready.engine.model.ChangedFile;
import io.agentready.engine.model.Evidence;
import io.agentready.engine.model.EvidenceKind;
import io.agentready.engine.model.FeatureSpec;
import io.agentready.engine.spec.SpecMatcher;

import java.util.ArrayList;
import java.util.List;

/**
 * When the feature spec flags sensitive concerns (auth, token, payment, migration, ...),
 * warns if the diff shows little or no sign of that concern.
 */
public final class RiskKeywordPresenceRule implements Rule {

    @Override
    public String id() {
        return "risk-keyword-presence";
    }

    @Override
    public String name() {
        return "Risk keyword presence";
    }

    @Override
    public RuleResult evaluate(RuleContext context) {
        FeatureSpec spec = context.featureSpec();
        if (spec == null || spec.riskKeywords().isEmpty()) {
            return RuleResult.skip("No risk keywords in the feature spec");
        }

        String corpus = context.specCorpus();
        List<String> present = new ArrayList<>();
        List<String> absent = new ArrayList<>();
        for (String keyword : spec.riskKeywords()) {
            if (SpecMatcher.containsKeyword(corpus, keyword)) {
                present.add(keyword);
            } else {
                absent.add(keyword);
            }
        }

        boolean riskyPathChanged = context.changedFiles().stream()
                .map(ChangedFile::path)
                .anyMatch(context.classifier()::isRiskyPath);

        if (!present.isEmpty() || riskyPathChanged) {
            return RuleResult.pass(
                    "Diff shows signs of the flagged sensitive area(s)",
                    keywordEvidence(present, "present"));
        }
        return RuleResult.warn(
                "The feature spec flags sensitive concerns (" + String.join(", ", absent)
                        + "), but the diff shows little sign of them",
                "Double-check that the sensitive behavior (and its tests) are actually covered.",
                keywordEvidence(absent, "absent"));
    }

    private static List<Evidence> keywordEvidence(List<String> keywords, String detail) {
        List<Evidence> evidence = new ArrayList<>();
        for (String keyword : keywords) {
            evidence.add(new Evidence(EvidenceKind.keyword, keyword, detail));
        }
        return evidence;
    }
}
