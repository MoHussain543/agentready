package io.agentready.engine.git;

import io.agentready.engine.model.ChangeType;
import io.agentready.engine.model.ChangedFile;
import io.agentready.engine.model.GitContext;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Read-only access to the local git working tree via the {@code git} CLI.
 *
 * <p>The engine never mutates the repository. All methods run short-lived subprocesses
 * in the repo directory and parse their stdout. Methods are overridable so the runner
 * can be unit tested without a real repository.
 */
public class GitService {

    private static final long TIMEOUT_SECONDS = 30;

    private final String gitExecutable;

    public GitService() {
        this("git");
    }

    public GitService(String gitExecutable) {
        this.gitExecutable = gitExecutable;
    }

    /** True if {@code repo} is inside a git work tree. */
    public boolean isGitRepository(Path repo) {
        if (repo == null || !Files.isDirectory(repo)) {
            return false;
        }
        try {
            GitCommandResult result = run(repo, List.of("rev-parse", "--is-inside-work-tree"));
            return result.ok() && "true".equals(result.stdout().trim());
        } catch (GitException e) {
            return false;
        }
    }

    /**
     * Changed files in the uncommitted diff (staged + unstaged + untracked), one entry per path.
     */
    public List<ChangedFile> changedFiles(Path repo) {
        GitCommandResult result = run(repo, statusArgs());
        if (!result.ok()) {
            throw new GitException("CHECK_FAILED", "git status failed: " + firstLine(result.stderr()));
        }

        List<ChangedFile> files = new ArrayList<>();
        for (String rawLine : result.stdout().split("\n", -1)) {
            String line = stripTrailingCr(rawLine);
            if (line.isEmpty()) {
                continue;
            }
            ChangedFile changedFile = parsePorcelainLine(line);
            if (changedFile != null) {
                files.add(changedFile);
            }
        }
        return files;
    }

    /** Branch, HEAD short SHA, dirty flag, and staged/unstaged counts when available. */
    public GitContext readGitContext(Path repo, List<ChangedFile> changedFiles) {
        String branch = firstLine(tryRunStdout(repo, List.of("rev-parse", "--abbrev-ref", "HEAD")));
        if ("HEAD".equals(branch)) {
            branch = null; // detached HEAD
        }
        String shortSha = firstLine(tryRunStdout(repo, List.of("rev-parse", "--short", "HEAD")));

        int staged = 0;
        int unstaged = 0;
        GitCommandResult status = tryRun(repo, statusArgs());
        if (status != null && status.ok()) {
            for (String rawLine : status.stdout().split("\n", -1)) {
                String line = stripTrailingCr(rawLine);
                if (line.length() < 2) {
                    continue;
                }
                char x = line.charAt(0);
                char y = line.charAt(1);
                if (x != ' ' && x != '?') {
                    staged++;
                }
                if (y != ' ') {
                    unstaged++;
                }
            }
        }

        boolean isDirty = !changedFiles.isEmpty();
        return new GitContext(branch, shortSha, isDirty, staged, unstaged);
    }

    /** Approximate changed line count (added + removed) for tracked changes vs HEAD. */
    public int changedLineCount(Path repo) {
        return changedLineCounts(repo).values().stream().mapToInt(Integer::intValue).sum();
    }

    /** Approximate changed line count by file path for the current uncommitted change set. */
    public Map<String, Integer> changedLineCounts(Path repo) {
        Map<String, Integer> totals = new LinkedHashMap<>();
        accumulateNumstat(repo, List.of("diff", "--numstat", "HEAD"), totals);

        GitCommandResult untracked = tryRun(repo, List.of("ls-files", "--others", "--exclude-standard"));
        if (untracked == null || !untracked.ok()) {
            return totals;
        }

        for (String rawLine : untracked.stdout().split("\n", -1)) {
            String relativePath = stripTrailingCr(rawLine).trim();
            if (relativePath.isEmpty()) {
                continue;
            }
            totals.put(unquote(relativePath), countFileLines(repo.resolve(relativePath)));
        }
        return totals;
    }

    /**
     * Added/new line content per file, used for content-based rules (e.g. secret scanning).
     *
     * <p>For tracked changes this is the {@code +} lines of {@code git diff HEAD}. For untracked
     * files (not yet in any diff) the full text content is treated as added. Binary and large
     * files are skipped.
     */
    public Map<String, List<String>> addedLinesByPath(Path repo) {
        Map<String, List<String>> result = new LinkedHashMap<>();

        GitCommandResult diff = tryRun(repo, List.of("diff", "HEAD", "--unified=0", "--no-color"));
        if (diff != null && diff.ok()) {
            parseAddedLines(diff.stdout(), result);
        } else {
            // No HEAD yet (no commits): staged content is the added content.
            GitCommandResult staged = tryRun(repo, List.of("diff", "--cached", "--unified=0", "--no-color"));
            if (staged != null && staged.ok()) {
                parseAddedLines(staged.stdout(), result);
            }
        }

        for (String path : untrackedFiles(repo)) {
            List<String> lines = readFileLines(repo.resolve(path));
            if (!lines.isEmpty()) {
                result.computeIfAbsent(path, key -> new ArrayList<>()).addAll(lines);
            }
        }
        return result;
    }

    /** Files known to git as untracked (respecting .gitignore). */
    public List<String> untrackedFiles(Path repo) {
        GitCommandResult result = tryRun(repo, List.of("ls-files", "--others", "--exclude-standard"));
        if (result == null || !result.ok()) {
            return List.of();
        }
        List<String> files = new ArrayList<>();
        for (String rawLine : result.stdout().split("\n", -1)) {
            String line = stripTrailingCr(rawLine);
            if (!line.isEmpty()) {
                files.add(unquote(line));
            }
        }
        return files;
    }

    private void parseAddedLines(String diff, Map<String, List<String>> out) {
        String current = null;
        for (String rawLine : diff.split("\n", -1)) {
            String line = stripTrailingCr(rawLine);
            if (line.startsWith("diff --git")) {
                current = null;
            } else if (line.startsWith("+++ ")) {
                String path = line.substring(4).trim();
                if (path.equals("/dev/null")) {
                    current = null;
                    continue;
                }
                if (path.startsWith("b/")) {
                    path = path.substring(2);
                }
                current = unquote(path);
                out.computeIfAbsent(current, key -> new ArrayList<>());
            } else if (current != null && line.startsWith("+") && !line.startsWith("+++")) {
                out.computeIfAbsent(current, key -> new ArrayList<>()).add(line.substring(1));
            }
        }
    }

    private List<String> readFileLines(Path file) {
        try {
            if (!Files.isRegularFile(file) || Files.size(file) > 512_000) {
                return List.of();
            }
            byte[] bytes = Files.readAllBytes(file);
            for (byte b : bytes) {
                if (b == 0) {
                    return List.of(); // skip binary
                }
            }
            return List.of(new String(bytes, StandardCharsets.UTF_8).split("\n", -1));
        } catch (IOException e) {
            return List.of();
        }
    }

    private static List<String> statusArgs() {
        return List.of("status", "--porcelain", "--untracked-files=all");
    }

    private ChangedFile parsePorcelainLine(String line) {
        if (line.length() < 3) {
            return null;
        }
        char x = line.charAt(0);
        char y = line.charAt(1);
        String pathPart = line.substring(3);

        int arrow = pathPart.indexOf(" -> ");
        if (arrow >= 0) {
            pathPart = pathPart.substring(arrow + 4);
        }
        pathPart = unquote(pathPart);
        if (pathPart.isEmpty()) {
            return null;
        }
        return new ChangedFile(pathPart, classify(x, y));
    }

    private static ChangeType classify(char x, char y) {
        if (x == 'A' || y == 'A' || (x == '?' && y == '?')) {
            return ChangeType.ADDED;
        }
        if (x == 'D' || y == 'D') {
            return ChangeType.DELETED;
        }
        return ChangeType.MODIFIED;
    }

    private static String unquote(String value) {
        if (value.length() >= 2 && value.startsWith("\"") && value.endsWith("\"")) {
            return value.substring(1, value.length() - 1);
        }
        return value;
    }

    private static int parseCount(String token) {
        try {
            return Integer.parseInt(token.trim());
        } catch (NumberFormatException e) {
            return 0; // "-" for binary files
        }
    }

    private static String stripTrailingCr(String line) {
        return line.endsWith("\r") ? line.substring(0, line.length() - 1) : line;
    }

    private static String firstLine(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.strip();
        if (trimmed.isEmpty()) {
            return null;
        }
        int newline = trimmed.indexOf('\n');
        return newline >= 0 ? trimmed.substring(0, newline) : trimmed;
    }

    private GitCommandResult tryRun(Path repo, List<String> args) {
        try {
            return run(repo, args);
        } catch (GitException e) {
            return null;
        }
    }

    private String tryRunStdout(Path repo, List<String> args) {
        GitCommandResult result = tryRun(repo, args);
        return result != null && result.ok() ? result.stdout() : null;
    }

    private GitCommandResult run(Path repo, List<String> args) {
        List<String> command = new ArrayList<>();
        command.add(gitExecutable);
        command.addAll(args);

        ProcessBuilder builder = new ProcessBuilder(command);
        builder.directory(repo.toFile());
        builder.redirectErrorStream(true);

        Process process;
        try {
            process = builder.start();
        } catch (IOException e) {
            throw new GitException("CHECK_FAILED", "Failed to run git: " + e.getMessage());
        }

        try {
            boolean finished = process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                throw new GitException("CHECK_FAILED", "git command timed out: " + String.join(" ", args));
            }

            String combinedOutput = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            if (process.exitValue() == 0) {
                return new GitCommandResult(process.exitValue(), combinedOutput, "");
            }
            return new GitCommandResult(process.exitValue(), "", combinedOutput);
        } catch (IOException e) {
            throw new GitException("CHECK_FAILED", "Failed to read git output: " + e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new GitException("CHECK_FAILED", "Interrupted while running git");
        }
    }

    private void accumulateNumstat(Path repo, List<String> args, Map<String, Integer> totals) {
        GitCommandResult result = tryRun(repo, args);
        if (result == null || !result.ok()) {
            return;
        }

        for (String rawLine : result.stdout().split("\n", -1)) {
            String line = stripTrailingCr(rawLine);
            if (line.isBlank()) {
                continue;
            }
            String[] parts = line.split("\t");
            if (parts.length >= 3) {
                String path = unquote(parts[2]);
                int count = parseCount(parts[0]) + parseCount(parts[1]);
                totals.merge(path, count, Integer::sum);
            }
        }
    }

    private int countFileLines(Path path) {
        if (!Files.isRegularFile(path)) {
            return 0;
        }
        try {
            byte[] bytes = Files.readAllBytes(path);
            if (bytes.length == 0) {
                return 0;
            }

            int lineCount = 0;
            for (byte current : bytes) {
                if (current == '\n') {
                    lineCount++;
                }
            }

            return bytes[bytes.length - 1] == '\n' ? lineCount : lineCount + 1;
        } catch (IOException e) {
            return 0;
        }
    }
}
