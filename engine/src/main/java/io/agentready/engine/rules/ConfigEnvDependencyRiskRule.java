package io.agentready.engine.rules;

import io.agentready.engine.diff.FileClassifier;
import io.agentready.engine.model.ChangedFile;
import io.agentready.engine.model.Evidence;
import io.agentready.engine.model.EvidenceKind;

import java.util.ArrayList;
import java.util.List;

/**
 * Warns when sensitive non-application files changed: config, env, dependency manifests,
 * CI/deploy, database migrations, or risky/auth/security-related paths.
 */
public final class ConfigEnvDependencyRiskRule implements Rule {

    @Override
    public String id() {
        return "config-env-dependency-risk";
    }

    @Override
    public String name() {
        return "Config / env / dependency risk";
    }

    @Override
    public RuleResult evaluate(RuleContext context) {
        FileClassifier classifier = context.classifier();

        List<Evidence> evidence = new ArrayList<>();
        for (ChangedFile file : context.changedFiles()) {
            String label = riskLabel(classifier, file.path());
            if (label != null) {
                evidence.add(new Evidence(EvidenceKind.file, file.path(), label));
            }
        }

        if (evidence.isEmpty()) {
            return RuleResult.pass(
                    "No config, env, dependency, CI, or migration files changed", List.of());
        }
        return RuleResult.warn(
                evidence.size() + " sensitive non-application file(s) changed",
                "Review these config/env/dependency/CI/migration changes carefully.",
                evidence);
    }

    private static String riskLabel(FileClassifier classifier, String path) {
        if (classifier.isEnvFile(path)) {
            return "env";
        }
        if (classifier.isDependencyManifest(path)) {
            return "dependency";
        }
        if (classifier.isCiOrDeployFile(path)) {
            return "ci/deploy";
        }
        if (classifier.isMigrationFile(path)) {
            return "migration";
        }
        if (classifier.isConfigFile(path)) {
            return "config";
        }
        if (classifier.isRiskyPath(path)) {
            return "risky path";
        }
        return null;
    }
}
