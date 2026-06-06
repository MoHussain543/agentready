package io.agentready.engine.rules;

import io.agentready.engine.model.Evidence;
import io.agentready.engine.model.EvidenceKind;
import io.agentready.engine.model.FeatureSpec;
import io.agentready.engine.spec.SpecMatcher;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Compares expectedStatusCodes from the feature spec against changed paths and diff content.
 */
public final class StatusCodeMatchRule implements Rule {

    @Override
    public String id() {
        return "status-code-match";
    }

    @Override
    public String name() {
        return "Status code coverage";
    }

    @Override
    public RuleResult evaluate(RuleContext context) {
        FeatureSpec spec = context.featureSpec();
        if (spec == null || spec.expectedStatusCodes().isEmpty()) {
            return RuleResult.skip("No expected status codes to match");
        }

        String corpus = context.specCorpus();
        List<Integer> found = new ArrayList<>();
        List<Integer> missing = new ArrayList<>();
        for (Integer code : spec.expectedStatusCodes()) {
            if (SpecMatcher.containsStatusCode(corpus, code)) {
                found.add(code);
            } else {
                missing.add(code);
            }
        }

        if (missing.isEmpty()) {
            return RuleResult.pass(
                    "All expected status codes were found: " + join(found),
                    codeEvidence(found, "found"));
        }

        String remediation = "The feature spec mentioned " + join(missing)
                + ", but that value was not found in changed paths or diff content.";
        if (found.isEmpty()) {
            return RuleResult.fail(
                    "None of the expected status codes (" + join(missing)
                            + ") were found in the diff",
                    remediation,
                    codeEvidence(missing, "missing"));
        }
        return RuleResult.warn(
                "Some expected status codes were not found. Missing: " + join(missing),
                remediation,
                codeEvidence(missing, "missing"));
    }

    private static String join(List<Integer> codes) {
        return codes.stream().map(String::valueOf).collect(Collectors.joining(", "));
    }

    private static List<Evidence> codeEvidence(List<Integer> codes, String detail) {
        List<Evidence> evidence = new ArrayList<>();
        for (Integer code : codes) {
            evidence.add(new Evidence(EvidenceKind.keyword, String.valueOf(code), detail));
        }
        return evidence;
    }
}
