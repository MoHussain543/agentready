package io.agentready.engine.model;

public record GitContext(
        String branch,
        String baseCommit,
        boolean isDirty,
        Integer stagedFileCount,
        Integer unstagedFileCount) {}
