package io.agentready.engine.rules;

import io.agentready.engine.diff.FileClassifier;
import io.agentready.engine.model.ChangedFile;
import io.agentready.engine.model.EngineOptions;
import io.agentready.engine.model.FeatureSpec;

import java.util.List;
import java.util.Map;

/**
 * Read-only inputs shared by all rules for a single readiness run.
 */
public final class RuleContext {

    private static final int DEFAULT_MAX_FILES = 50;
    private static final int DEFAULT_MAX_LINES = 2000;

    private final String repoPath;
    private final List<ChangedFile> changedFiles;
    private final FileClassifier classifier;
    private final Map<String, List<String>> addedLinesByPath;
    private final int totalChangedLines;
    private final EngineOptions options;
    private final FeatureSpec featureSpec;

    private String cachedCorpus;
    private DiffProfile cachedDiffProfile;

    public RuleContext(
            String repoPath,
            List<ChangedFile> changedFiles,
            FileClassifier classifier,
            Map<String, List<String>> addedLinesByPath,
            int totalChangedLines,
            EngineOptions options,
            FeatureSpec featureSpec) {
        this.repoPath = repoPath;
        this.changedFiles = List.copyOf(changedFiles);
        this.classifier = classifier;
        this.addedLinesByPath = addedLinesByPath;
        this.totalChangedLines = totalChangedLines;
        this.options = options;
        this.featureSpec = featureSpec;
    }

    public String repoPath() {
        return repoPath;
    }

    public List<ChangedFile> changedFiles() {
        return changedFiles;
    }

    public FileClassifier classifier() {
        return classifier;
    }

    public Map<String, List<String>> addedLinesByPath() {
        return addedLinesByPath;
    }

    public int totalChangedLines() {
        return totalChangedLines;
    }

    public int maxFiles() {
        if (options != null && options.largeDiffMaxFiles() != null) {
            return options.largeDiffMaxFiles();
        }
        return DEFAULT_MAX_FILES;
    }

    public int maxLines() {
        if (options != null && options.largeDiffMaxLines() != null) {
            return options.largeDiffMaxLines();
        }
        return DEFAULT_MAX_LINES;
    }

    public FeatureSpec featureSpec() {
        return featureSpec;
    }

    /**
     * Derived diff properties used by rules to calibrate their thresholds.
     * Built lazily and cached.
     */
    public DiffProfile diffProfile() {
        if (cachedDiffProfile == null) {
            cachedDiffProfile = new DiffProfile(changedFiles, classifier, totalChangedLines);
        }
        return cachedDiffProfile;
    }

    /**
     * Lowercased, newline-joined search corpus of changed file paths and added line content.
     * Built lazily and cached for spec-aware matching.
     */
    public String specCorpus() {
        if (cachedCorpus == null) {
            StringBuilder builder = new StringBuilder();
            for (ChangedFile file : changedFiles) {
                builder.append(file.path().toLowerCase()).append('\n');
            }
            if (addedLinesByPath != null) {
                for (List<String> lines : addedLinesByPath.values()) {
                    for (String line : lines) {
                        builder.append(line.toLowerCase()).append('\n');
                    }
                }
            }
            cachedCorpus = builder.toString();
        }
        return cachedCorpus;
    }
}
