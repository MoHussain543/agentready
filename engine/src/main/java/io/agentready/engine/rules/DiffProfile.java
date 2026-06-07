package io.agentready.engine.rules;

import io.agentready.engine.diff.FileClassifier;
import io.agentready.engine.model.ChangedFile;

import java.util.List;

/**
 * Derived, read-only properties of the diff that rules use to calibrate their thresholds.
 *
 * <p>All predicates are heuristic and path-based only — no content inspection.
 * Instantiated once per run by {@link RuleContext#diffProfile()}.
 */
public final class DiffProfile {

    /** Maximum production source file count for a diff to qualify as tiny. */
    static final int TINY_MAX_PRODUCTION_FILES = 3;

    /** Maximum total changed-line count for a diff to qualify as tiny. */
    static final int TINY_MAX_CHANGED_LINES = 25;

    private final List<ChangedFile> productionFiles;
    private final boolean anyRiskyProductionFile;
    private final int totalChangedLines;

    DiffProfile(List<ChangedFile> changedFiles, FileClassifier classifier, int totalChangedLines) {
        this.totalChangedLines = totalChangedLines;
        this.productionFiles = changedFiles.stream()
                .filter(f -> classifier.isProductionSource(f.path()))
                .toList();
        this.anyRiskyProductionFile = this.productionFiles.stream()
                .anyMatch(f -> classifier.isRiskyPath(f.path()));
    }

    /**
     * Production source files (non-test source files) in the diff.
     */
    public List<ChangedFile> productionFiles() {
        return productionFiles;
    }

    /**
     * True when the diff is small enough and low-risk enough that a missing test change
     * is not a meaningful signal.
     *
     * <p>All three conditions must hold:
     * <ul>
     *   <li>At most {@value #TINY_MAX_PRODUCTION_FILES} production source files changed</li>
     *   <li>Total changed lines across all files ≤ {@value #TINY_MAX_CHANGED_LINES}</li>
     *   <li>No production file sits on a risky path (auth, payment, token, …)</li>
     * </ul>
     *
     * <p>Intent: a 1–3 file, sub-25-line edit to non-sensitive code (e.g. a UI label or
     * a doc comment) should not produce a noise warning about missing tests.
     */
    public boolean isTinyLowRisk() {
        return productionFiles.size() <= TINY_MAX_PRODUCTION_FILES
                && totalChangedLines <= TINY_MAX_CHANGED_LINES
                && !anyRiskyProductionFile;
    }
}
