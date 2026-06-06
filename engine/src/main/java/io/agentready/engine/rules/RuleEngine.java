package io.agentready.engine.rules;

import java.util.List;

/**
 * Registry of baseline rules for the free-v1-precommit suite. No plugin system yet:
 * the suite is a fixed, ordered list.
 */
public final class RuleEngine {

    private RuleEngine() {}

    public static List<Rule> baselineRules() {
        return List.of(
                new ChangedFileSummaryRule(),
                new ProductionWithoutTestsRule(),
                new DeletedTestFilesRule(),
                new ConfigEnvDependencyRiskRule(),
                new LargeDiffRule(),
                new HardcodedSecretsRule());
    }
}
