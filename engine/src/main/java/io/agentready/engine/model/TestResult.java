package io.agentready.engine.model;

public record TestResult(
        boolean ran,
        TestResultStatus status,
        String command,
        Integer exitCode,
        Integer durationMs,
        String stdoutSnippet,
        String stderrSnippet,
        String message) {}
