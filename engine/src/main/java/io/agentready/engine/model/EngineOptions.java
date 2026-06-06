package io.agentready.engine.model;

public record EngineOptions(
        String checkSuite,
        Long largeFileThresholdBytes,
        Integer secretsScanMaxFiles) {}
