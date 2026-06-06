package io.agentready.engine.model;

public record EngineOptions(
        String checkSuite,
        Integer largeDiffMaxLines,
        Integer largeDiffMaxFiles,
        Boolean includeStaged,
        Boolean includeUnstaged) {}
