package io.agentready.engine.rules;

import io.agentready.engine.model.Evidence;
import io.agentready.engine.model.EvidenceKind;
import io.agentready.engine.model.FeatureSpec;
import io.agentready.engine.spec.SpecMatcher;

import java.util.ArrayList;
import java.util.List;

/**
 * Compares expectedKeywords from the feature spec against changed paths and added diff content.
 * Conservative: never claims the feature is wrong, only reports coverage signals.
 */
public final class SpecKeywordMatchRule implements Rule {

    private static final double REASONABLE_COVERAGE = 0.5;
    private static final int STRONG_SPEC_MIN_KEYWORDS = 3;

    @Override
    public String id() {
        return "spec-keyword-match";
    }

    @Override
    public String name() {
        return "Spec keyword coverage";
    }

    @Override
    public RuleResult evaluate(RuleContext context) {
        FeatureSpec spec = context.featureSpec();
        if (spec == null || spec.expectedKeywords().isEmpty()) {
            return RuleResult.skip("No feature spec keywords to match");
        }

        String corpus = context.specCorpus();
        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        for (String keyword : spec.expectedKeywords()) {
            if (SpecMatcher.containsKeyword(corpus, keyword)) {
                matched.add(keyword);
            } else {
                missing.add(keyword);
            }
        }

        int total = spec.expectedKeywords().size();
        double ratio = (double) matched.size() / total;
        String coverage = "(" + matched.size() + "/" + total + ")";

        if (ratio >= REASONABLE_COVERAGE) {
            return RuleResult.pass(
                    "Expected keyword coverage looks reasonable " + coverage,
                    keywordEvidence(matched, "found"));
        }

        String missingList = String.join(", ", missing);
        if (matched.isEmpty() && total >= STRONG_SPEC_MIN_KEYWORDS) {
            return RuleResult.fail(
                    "The feature spec lists " + total + " keywords, but none appear in the "
                            + "changed paths or diff content. Missing: " + missingList,
                    "Confirm the diff actually implements the requested feature, or update the "
                            + "feature description.",
                    keywordEvidence(missing, "missing"));
        }
        return RuleResult.warn(
                "Expected keyword coverage appears incomplete " + coverage
                        + ". Missing: " + missingList,
                "Review whether the missing concepts still need to be implemented.",
                keywordEvidence(missing, "missing"));
    }

    private static List<Evidence> keywordEvidence(List<String> keywords, String detail) {
        List<Evidence> evidence = new ArrayList<>();
        for (String keyword : keywords) {
            evidence.add(new Evidence(EvidenceKind.keyword, keyword, detail));
        }
        return evidence;
    }
}
