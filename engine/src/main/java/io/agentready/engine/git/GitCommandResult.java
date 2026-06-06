package io.agentready.engine.git;

/**
 * Result of a single git subprocess invocation.
 */
public record GitCommandResult(int exitCode, String stdout, String stderr) {

    public boolean ok() {
        return exitCode == 0;
    }
}
