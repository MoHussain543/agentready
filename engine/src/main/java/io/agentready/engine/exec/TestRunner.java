package io.agentready.engine.exec;

import io.agentready.engine.model.TestResult;
import io.agentready.engine.model.TestResultStatus;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Executes a single repo-local test command and shapes the outcome into a {@link TestResult}.
 *
 * <p>Generic and repo-agnostic: the configured command (e.g. {@code mvn test}, {@code npm test})
 * is run through the OS shell in the repo directory. A timeout prevents a hung suite from blocking
 * forever, and captured output is truncated to a short tail. Overridable for unit testing.
 */
public class TestRunner {

    private static final long DEFAULT_TIMEOUT_SECONDS = 600;
    private static final int SNIPPET_MAX_CHARS = 2000;
    private static final int BUFFER_MAX_CHARS = SNIPPET_MAX_CHARS * 4;

    private final long timeoutSeconds;

    public TestRunner() {
        this(DEFAULT_TIMEOUT_SECONDS);
    }

    public TestRunner(long timeoutSeconds) {
        this.timeoutSeconds = timeoutSeconds;
    }

    public TestResult run(Path repo, String command) {
        long start = System.nanoTime();
        ProcessBuilder builder = new ProcessBuilder(shellCommand(command));
        builder.directory(repo.toFile());
        builder.redirectErrorStream(true);

        Process process;
        try {
            process = builder.start();
        } catch (IOException e) {
            return new TestResult(false, TestResultStatus.error, command, null, elapsedMs(start),
                    null, null, "Could not start test command: " + e.getMessage());
        }

        StringBuilder output = new StringBuilder();
        Thread reader = startOutputReader(process, output);

        boolean finished;
        try {
            finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            process.destroyForcibly();
            return new TestResult(true, TestResultStatus.error, command, null, elapsedMs(start),
                    snippet(output), null, "Test execution was interrupted");
        }

        if (!finished) {
            process.destroyForcibly();
            joinQuietly(reader);
            return new TestResult(true, TestResultStatus.fail, command, null, elapsedMs(start),
                    snippet(output), null, "Test command timed out after " + timeoutSeconds + "s");
        }

        joinQuietly(reader);
        int exitCode = process.exitValue();
        if (isCommandNotFound(exitCode)) {
            return new TestResult(false, TestResultStatus.error, command, exitCode, elapsedMs(start),
                    snippet(output), null,
                    "Could not start test command: shell could not locate `" + command + "`");
        }
        TestResultStatus status = exitCode == 0 ? TestResultStatus.pass : TestResultStatus.fail;
        String message = exitCode == 0
                ? "Tests passed"
                : "Tests failed with exit code " + exitCode;
        return new TestResult(true, status, command, exitCode, elapsedMs(start),
                snippet(output), null, message);
    }

    private static Thread startOutputReader(Process process, StringBuilder output) {
        Thread reader = new Thread(() -> {
            try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = br.readLine()) != null) {
                    synchronized (output) {
                        output.append(line).append('\n');
                        if (output.length() > BUFFER_MAX_CHARS) {
                            output.delete(0, output.length() - BUFFER_MAX_CHARS);
                        }
                    }
                }
            } catch (IOException ignored) {
                // Stream closed when the process exits; nothing actionable.
            }
        });
        reader.setDaemon(true);
        reader.start();
        return reader;
    }

    private static List<String> shellCommand(String command) {
        String os = System.getProperty("os.name", "").toLowerCase();
        if (os.contains("win")) {
            return List.of("cmd.exe", "/c", command);
        }
        return List.of("sh", "-c", command);
    }

    private static boolean isCommandNotFound(int exitCode) {
        String os = System.getProperty("os.name", "").toLowerCase();
        if (os.contains("win")) {
            return exitCode == 9009;
        }
        return exitCode == 127;
    }

    private static String snippet(StringBuilder output) {
        String text;
        synchronized (output) {
            text = output.toString();
        }
        text = text.strip();
        if (text.isEmpty()) {
            return null;
        }
        if (text.length() > SNIPPET_MAX_CHARS) {
            return "...(truncated)\n" + text.substring(text.length() - SNIPPET_MAX_CHARS);
        }
        return text;
    }

    private static void joinQuietly(Thread thread) {
        try {
            thread.join(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private static int elapsedMs(long startNanos) {
        return (int) ((System.nanoTime() - startNanos) / 1_000_000);
    }
}
