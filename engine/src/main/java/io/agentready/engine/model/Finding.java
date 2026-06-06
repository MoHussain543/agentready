package io.agentready.engine.model;

import java.util.List;

public record Finding(
        String checkId,
        FindingSeverity severity,
        String message,
        List<String> paths) {

    public Finding {
        paths = paths == null ? List.of() : List.copyOf(paths);
    }
}
