package io.agentready.engine.rules;

/**
 * A single baseline readiness rule evaluated against the current diff.
 */
public interface Rule {

    String id();

    String name();

    RuleResult evaluate(RuleContext context);
}
