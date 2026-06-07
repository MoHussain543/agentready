package io.agentready.engine.diff;

/**
 * Coarse, stack-agnostic classification of a changed file.
 */
public enum FileCategory {
    TEST,
    CONFIG,
    ENV,
    DEPENDENCY,
    DOCS,
    STYLE,
    CI,
    MIGRATION,
    RISKY,
    SOURCE,
    OTHER
}
