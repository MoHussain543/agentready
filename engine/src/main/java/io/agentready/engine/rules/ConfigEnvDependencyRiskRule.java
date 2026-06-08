package io.agentready.engine.rules;

import io.agentready.engine.diff.FileClassifier;
import io.agentready.engine.model.ChangedFile;
import io.agentready.engine.model.Evidence;
import io.agentready.engine.model.EvidenceKind;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

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

        Set<String> labels = new LinkedHashSet<>();
        for (Evidence item : evidence) {
            if (item.detail() != null && !item.detail().isBlank()) {
                labels.add(item.detail());
            }
        }

        return RuleResult.warn(
                describeRisk(labels, evidence.size()),
                remediation(labels),
                evidence);
    }

    private static String describeRisk(Set<String> labels, int count) {
        if (labels.size() == 1) {
            String label = labels.iterator().next();
            return switch (label) {
                case "dependency" -> count + " dependency manifest file(s) changed";
                case "env" -> count + " environment file(s) changed";
                case "ci/deploy" -> count + " CI/deploy file(s) changed";
                case "migration" -> count + " migration file(s) changed";
                case "config" -> count + " config file(s) changed";
                case "risky path" -> count + " sensitive auth/security/payment file(s) changed";
                default -> count + " infrastructure file(s) changed";
            };
        }
        return count + " config/env/dependency/CI/migration file(s) changed";
    }

    private static String remediation(Set<String> labels) {
        if (labels.size() == 1 && labels.contains("dependency")) {
            return "Verify that this feature really needs a package manifest change before committing.";
        }
        if (labels.size() == 1 && labels.contains("config")) {
            return "Confirm the feature really requires this config change before committing.";
        }
        if (labels.size() == 1 && labels.contains("env")) {
            return "Review environment-file changes carefully and avoid committing sensitive values.";
        }
        if (labels.size() == 1 && labels.contains("migration")) {
            return "Review the migration carefully and confirm it belongs to this feature.";
        }
        if (labels.size() == 1 && labels.contains("ci/deploy")) {
            return "Review CI/deploy changes carefully and confirm they are intentional.";
        }
        if (labels.size() == 1 && labels.contains("risky path")) {
            return "Review this sensitive auth/security/payment change carefully before committing.";
        }
        return "Review these config/env/dependency/CI/migration changes carefully.";
    }

    private static String riskLabel(FileClassifier classifier, String path) {
        if (classifier.isTestFile(path)) {
            return null;
        }
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
