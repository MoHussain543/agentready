package io.agentready.engine.git;

/**
 * Raised when a git operation fails. Carries an engine error code so the runner can
 * map it onto the structured EngineResponse error envelope.
 */
public class GitException extends RuntimeException {

    private final String code;

    public GitException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String code() {
        return code;
    }
}
