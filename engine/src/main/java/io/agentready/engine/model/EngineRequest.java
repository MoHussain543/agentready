package io.agentready.engine.model;

/**
 * JSON request envelope (see docs/architecture.md).
 */
public record EngineRequest(
        String protocolVersion,
        String command,
        String repoPath,
        EngineOptions options) {}
