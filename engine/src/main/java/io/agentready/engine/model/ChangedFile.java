package io.agentready.engine.model;

/**
 * A single path change in the uncommitted diff. Used when building {@link DiffSummary}.
 */
public record ChangedFile(String path, ChangeType changeType) {}
