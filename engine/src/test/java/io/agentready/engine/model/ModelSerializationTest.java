package io.agentready.engine.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.agentready.engine.json.JsonMapperFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ModelSerializationTest {

    private ObjectMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = JsonMapperFactory.create();
    }

    @Test
    void roundTripsFeatureSpec() throws Exception {
        FeatureSpec spec = new FeatureSpec(
                "1.0",
                UUID.fromString("0b11d4e5-2b3f-4f7f-8b14-3f7d8f4b8e1f"),
                "Return 404 for missing users",
                "API should return 404 when user id not found",
                List.of("user", "not found", "404"),
                List.of(404),
                List.of("auth"),
                Instant.parse("2026-06-06T16:00:00Z"),
                Instant.parse("2026-06-06T16:00:00Z"));

        String json = mapper.writeValueAsString(spec);
        FeatureSpec restored = mapper.readValue(json, FeatureSpec.class);

        assertEquals(spec, restored);
        assertTrue(json.contains("\"expectedKeywords\":[\"user\",\"not found\",\"404\"]"));
        assertTrue(json.contains("\"expectedStatusCodes\":[404]"));
    }

    @Test
    void roundTripsReadinessReport() throws Exception {
        ReadinessReport report = sampleReport();

        String json = mapper.writeValueAsString(report);
        ReadinessReport restored = mapper.readValue(json, ReadinessReport.class);

        assertEquals(report, restored);
        assertTrue(json.contains("\"verdict\":\"NEEDS_REVIEW\""));
        assertTrue(json.contains("\"verdictExplanation\""));
        assertTrue(json.contains("\"totalChangedLines\":42"));
    }

    @Test
    void roundTripsEngineRequestAndResponse() throws Exception {
        EngineRequest request = new EngineRequest(
                "1.0",
                "run_readiness",
                "/tmp/demo-repo",
                new FeatureSpec(
                        "1.0",
                        UUID.fromString("0b11d4e5-2b3f-4f7f-8b14-3f7d8f4b8e1f"),
                        "Demo feature",
                        "Handle 410 for retired endpoints",
                        List.of("410", "retired"),
                        List.of(410),
                        List.of(),
                        Instant.parse("2026-06-06T16:00:00Z"),
                        Instant.parse("2026-06-06T16:00:00Z")),
                new EngineOptions("free-v1-precommit", 2000, 50, true, true, true, "mvn test"));

        EngineResponse response = EngineResponse.ok("1.0", sampleReport());

        String requestJson = mapper.writeValueAsString(request);
        String responseJson = mapper.writeValueAsString(response);

        assertEquals(request, mapper.readValue(requestJson, EngineRequest.class));
        assertEquals(response, mapper.readValue(responseJson, EngineResponse.class));
        assertTrue(requestJson.contains("\"command\":\"run_readiness\""));
        assertTrue(responseJson.contains("\"status\":\"ok\""));
    }

    @Test
    void omitsNullFields() throws Exception {
        String json = mapper.writeValueAsString(new EngineResponse("1.0", "error", null,
                new EngineError("INVALID_REPO", "missing .git")));

        assertFalse(json.contains("\"report\""));
        assertTrue(json.contains("\"code\":\"INVALID_REPO\""));
    }

    @Test
    void diffSummaryFromChangedFilesSerializes() throws Exception {
        DiffSummary summary = DiffSummary.fromChangedFiles(
                List.of(
                        new ChangedFile("src/Foo.java", ChangeType.MODIFIED),
                        new ChangedFile("src/FooTest.java", ChangeType.ADDED)),
                42);

        String json = mapper.writeValueAsString(summary);
        DiffSummary restored = mapper.readValue(json, DiffSummary.class);

        assertEquals(summary, restored);
        assertEquals(2, restored.totalFiles());
        assertNotNull(restored.added());
        assertEquals(1, restored.added().size());
    }

    private ReadinessReport sampleReport() {
        DiffSummary diffSummary = DiffSummary.fromChangedFiles(
                List.of(new ChangedFile("src/App.java", ChangeType.MODIFIED)),
                42);

        return new ReadinessReport(
                "1.0",
                Instant.parse("2026-06-06T16:05:00Z"),
                "/tmp/demo-repo",
                "free-v1-precommit@1",
                "0.1.0-SNAPSHOT",
                "0.1.0",
                25,
                UUID.fromString("0b11d4e5-2b3f-4f7f-8b14-3f7d8f4b8e1f"),
                new GitContext("main", "abc1234", true, 1, 0),
                Verdict.NEEDS_REVIEW,
                "No blocking issues were found, but some changes need review.",
                diffSummary,
                new CheckSummary(1, 1, 0, 0, 2),
                List.of(
                        new CheckResult("large-diff", "Large diff", CheckStatus.warn,
                                "Diff is large", "Consider splitting changes", List.of(), 2),
                        new CheckResult("changed-file-summary", "Changed file summary", CheckStatus.pass,
                                "1 file changed", null, List.of(), 1)),
                List.of(new Finding("large-diff", FindingSeverity.warn, "Diff exceeds threshold",
                        List.of("src/App.java"))),
                List.of("changed-file-summary"),
                new TestResult(false, TestResultStatus.skip, null, null, null, null, null, "Not run"),
                "Review large diff before commit.");
    }
}
