package io.agentready.engine.rules;

import io.agentready.engine.model.Evidence;
import io.agentready.engine.model.EvidenceKind;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Warns when added/modified content contains likely hardcoded secrets.
 * Dependency lockfiles are skipped to avoid false positives on hashes.
 */
public final class HardcodedSecretsRule implements Rule {

    @Override
    public String id() {
        return "hardcoded-secrets";
    }

    @Override
    public String name() {
        return "Hardcoded secrets";
    }

    @Override
    public RuleResult evaluate(RuleContext context) {
        Map<String, List<String>> addedLines = context.addedLinesByPath();
        if (addedLines == null || addedLines.isEmpty()) {
            return RuleResult.skip("No added content to scan for secrets");
        }

        List<Evidence> hits = new ArrayList<>();
        for (Map.Entry<String, List<String>> entry : addedLines.entrySet()) {
            String path = entry.getKey();
            if (context.classifier().isDependencyManifest(path)) {
                continue;
            }
            for (String line : entry.getValue()) {
                if (SecretScanner.looksLikeSecret(line)) {
                    hits.add(new Evidence(EvidenceKind.file, path, "possible hardcoded secret"));
                    break; // one finding per file is enough; do not echo the value
                }
            }
        }

        if (hits.isEmpty()) {
            return RuleResult.pass("No obvious hardcoded secrets in added content", List.of());
        }
        return RuleResult.warn(
                "Possible hardcoded secret(s) in " + hits.size() + " file(s)",
                "Move secrets to environment variables or a secrets manager before committing.",
                hits);
    }
}
