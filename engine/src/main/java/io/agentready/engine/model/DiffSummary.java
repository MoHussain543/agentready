package io.agentready.engine.model;

import java.util.ArrayList;
import java.util.List;

public record DiffSummary(
        List<String> added,
        List<String> modified,
        List<String> deleted,
        int totalFiles,
        int totalChangedLines) {

    public DiffSummary {
        added = added == null ? List.of() : List.copyOf(added);
        modified = modified == null ? List.of() : List.copyOf(modified);
        deleted = deleted == null ? List.of() : List.copyOf(deleted);
    }

    public static DiffSummary fromChangedFiles(List<ChangedFile> files, int totalChangedLines) {
        List<String> added = new ArrayList<>();
        List<String> modified = new ArrayList<>();
        List<String> deleted = new ArrayList<>();

        for (ChangedFile file : files) {
            switch (file.changeType()) {
                case ADDED -> added.add(file.path());
                case MODIFIED -> modified.add(file.path());
                case DELETED -> deleted.add(file.path());
            }
        }

        return new DiffSummary(added, modified, deleted, files.size(), totalChangedLines);
    }
}
