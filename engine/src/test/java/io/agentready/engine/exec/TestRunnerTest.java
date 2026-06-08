package io.agentready.engine.exec;

import io.agentready.engine.model.TestResult;
import io.agentready.engine.model.TestResultStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

class TestRunnerTest {

    @BeforeEach
    void skipOnWindows() {
        assumeTrue(!System.getProperty("os.name", "").toLowerCase().contains("win"),
                "POSIX shell required for these tests");
    }

    @Test
    void passingCommandReportsPass(@TempDir Path dir) {
        TestResult result = new TestRunner(30).run(dir, "exit 0");

        assertTrue(result.ran());
        assertEquals(TestResultStatus.pass, result.status());
        assertEquals(0, result.exitCode());
    }

    @Test
    void failingCommandReportsFailWithExitCode(@TempDir Path dir) {
        TestResult result = new TestRunner(30).run(dir, "echo boom; exit 3");

        assertEquals(TestResultStatus.fail, result.status());
        assertEquals(3, result.exitCode());
        assertNotNull(result.stdoutSnippet());
        assertTrue(result.stdoutSnippet().contains("boom"));
    }

    @Test
    void hangingCommandTimesOut(@TempDir Path dir) {
        TestResult result = new TestRunner(1).run(dir, "sleep 5");

        assertEquals(TestResultStatus.fail, result.status());
        assertTrue(result.message().toLowerCase().contains("timed out"));
    }

    @Test
    void unrunnableCommandReportsErrorWithoutClaimingTestsRan(@TempDir Path dir) {
        TestResult result = new TestRunner(30).run(dir, "command_that_does_not_exist_12345");

        assertEquals(TestResultStatus.error, result.status());
        assertFalse(result.ran());
        assertNotNull(result.message());
    }

    @Test
    void commandCanRunFromConfiguredSubdirectory(@TempDir Path dir) throws Exception {
        Files.createDirectories(dir.resolve("apps/desktop"));

        TestResult result = new TestRunner(30).run(dir, "pwd", "apps/desktop");

        assertEquals(TestResultStatus.pass, result.status());
        assertNotNull(result.stdoutSnippet());
        assertTrue(result.stdoutSnippet().contains("apps/desktop"));
    }

    @Test
    void invalidWorkingDirectoryReportsError(@TempDir Path dir) {
        TestResult result = new TestRunner(30).run(dir, "pwd", "../outside");

        assertEquals(TestResultStatus.error, result.status());
        assertFalse(result.ran());
        assertNotNull(result.message());
    }
}
