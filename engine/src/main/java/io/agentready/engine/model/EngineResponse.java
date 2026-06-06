package io.agentready.engine.model;

/**
 * JSON response envelope (see docs/architecture.md).
 */
public record EngineResponse(
        String protocolVersion,
        String status,
        ReadinessReport report,
        EngineError error) {

    public static EngineResponse ok(String protocolVersion, ReadinessReport report) {
        return new EngineResponse(protocolVersion, "ok", report, null);
    }

    public static EngineResponse error(String protocolVersion, EngineError error) {
        return new EngineResponse(protocolVersion, "error", null, error);
    }
}
