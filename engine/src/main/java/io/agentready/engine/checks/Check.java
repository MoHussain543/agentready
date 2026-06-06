package io.agentready.engine.checks;

/**
 * Contract for a single readiness check. Implementations will be added in a later pass.
 */
public interface Check {

    String id();

    String name();
}
