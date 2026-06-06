package io.agentready.engine.git;

import io.agentready.engine.model.ChangeType;
import io.agentready.engine.model.ChangedFile;
import io.agentready.engine.model.GitContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

class GitServiceTest {

    private final GitService gitService = new GitService();

    @BeforeEach
    void requireGit() {
        assumeTrue(gitAvailable(), "git CLI not available");
    }

    @Test
    void detectsGitRepository(@TempDir Path dir) throws Exception {
        assertFalse(gitService.isGitRepository(dir), "fresh dir is not a repo");

        initRepo(dir);

        assertTrue(gitService.isGitRepository(dir));
    }

    @Test
    void classifiesAddedModifiedAndDeletedFiles(@TempDir Path dir) throws Exception {
        initRepo(dir);
        write(dir, "a.txt", "original\n");
        write(dir, "d.txt", "to be deleted\n");
        runGit(dir, "add", "-A");
        runGit(dir, "commit", "-m", "init");

        write(dir, "a.txt", "modified content\n");
        Files.delete(dir.resolve("d.txt"));
        write(dir, "c.txt", "brand new\n");

        Map<String, ChangeType> byPath = gitService.changedFiles(dir).stream()
                .collect(Collectors.toMap(ChangedFile::path, ChangedFile::changeType));

        assertEquals(ChangeType.MODIFIED, byPath.get("a.txt"));
        assertEquals(ChangeType.DELETED, byPath.get("d.txt"));
        assertEquals(ChangeType.ADDED, byPath.get("c.txt"));
        assertEquals(3, byPath.size());
    }

    @Test
    void readsGitContextForDirtyRepo(@TempDir Path dir) throws Exception {
        initRepo(dir);
        write(dir, "a.txt", "v1\n");
        runGit(dir, "add", "-A");
        runGit(dir, "commit", "-m", "init");
        write(dir, "a.txt", "v2\n");

        List<ChangedFile> changed = gitService.changedFiles(dir);
        GitContext context = gitService.readGitContext(dir, changed);

        assertNotNull(context.branch());
        assertNotNull(context.baseCommit());
        assertTrue(context.isDirty());
        assertEquals(1, changed.size());
        assertTrue(gitService.changedLineCount(dir) > 0);
    }

    private void initRepo(Path dir) throws Exception {
        runGit(dir, "init");
        runGit(dir, "config", "user.email", "test@agentready.dev");
        runGit(dir, "config", "user.name", "AgentReady Test");
    }

    private void write(Path dir, String name, String content) throws IOException {
        Files.writeString(dir.resolve(name), content);
    }

    private void runGit(Path dir, String... args) throws Exception {
        String[] command = new String[args.length + 1];
        command[0] = "git";
        System.arraycopy(args, 0, command, 1, args.length);

        Process process = new ProcessBuilder(command)
                .directory(dir.toFile())
                .redirectErrorStream(true)
                .start();
        String output = new String(process.getInputStream().readAllBytes());
        boolean finished = process.waitFor(30, TimeUnit.SECONDS);
        if (!finished || process.exitValue() != 0) {
            throw new IllegalStateException(
                    "git " + String.join(" ", args) + " failed: " + output);
        }
    }

    private static boolean gitAvailable() {
        try {
            Process process = new ProcessBuilder("git", "--version").start();
            return process.waitFor(10, TimeUnit.SECONDS) && process.exitValue() == 0;
        } catch (IOException | InterruptedException e) {
            return false;
        }
    }
}
