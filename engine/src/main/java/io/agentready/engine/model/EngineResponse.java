package io.agentready.engine.model;

/**
 * JSON response envelope (see docs/architecture.md).
 */
public record EngineResponse(
        String protocolVersion,
        String status,
        String report,
        EngineError error) {}
