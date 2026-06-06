package io.agentready.engine.model;

public record CheckSummary(int pass, int warn, int fail, int skip, int total) {}
