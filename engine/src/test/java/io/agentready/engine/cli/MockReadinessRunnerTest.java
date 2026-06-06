package io.agentready.engine.cli;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.agentready.engine.json.JsonMapperFactory;
import io.agentready.engine.model.EngineRequest;
import io.agentready.engine.model.EngineResponse;
import io.agentready.engine.model.Verdict;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import io.agentready.engine.model.FeatureSpec;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class MockReadinessRunnerTest {

    private final ObjectMapper mapper = JsonMapperFactory.create();
    private final EngineRunner runner = new EngineRunner();

    @Test
    void returnsMockReportForValidRequest() throws Exception {
        String requestJson = """
                {
                  "protocolVersion": "1.0",
                  "command": "run_readiness",
                  "repoPath": "/tmp/demo-repo",
                  "featureSpec": {
                    "schemaVersion": "1.0",
                    "id": "0b11d4e5-2b3f-4f7f-8b14-3f7d8f4b8e1f",
                    "title": "Return 404 for missing users",
                    "originalFeatureDescription": "API should return 404 when user id not found",
                    "expectedKeywords": ["user", "404"],
                    "expectedStatusCodes": [404],
                    "riskKeywords": [],
                    "createdAt": "2026-06-06T16:00:00Z",
                    "updatedAt": "2026-06-06T16:00:00Z"
                  }
                }
                """;

        EngineResponse response = mapper.readValue(runner.handleJson(requestJson), EngineResponse.class);

        assertEquals("ok", response.status());
        assertNotNull(response.report());
        assertEquals(Verdict.READY_TO_COMMIT, response.report().verdict());
        assertEquals("/tmp/demo-repo", response.report().repoPath());
        assertEquals(UUID.fromString("0b11d4e5-2b3f-4f7f-8b14-3f7d8f4b8e1f"), response.report().featureSpecId());
        assertEquals(2, response.report().diffSummary().totalFiles());
        assertNull(response.error());
    }

    @Test
    void returnsErrorForUnknownCommand() throws Exception {
        EngineResponse response = mapper.readValue(
                runner.handleJson("""
                        {"protocolVersion":"1.0","command":"ping","repoPath":"/tmp/repo"}
                        """),
                EngineResponse.class);

        assertEquals("error", response.status());
        assertEquals("UNKNOWN_COMMAND", response.error().code());
    }

    @Test
    void returnsErrorForInvalidJson() throws Exception {
        EngineResponse response = mapper.readValue(runner.handleJson("{not-json"), EngineResponse.class);

        assertEquals("error", response.status());
        assertEquals("INVALID_JSON", response.error().code());
    }

    @Test
    void mockRunnerUsesFeatureTitleInRepairPrompt() {
        EngineRequest request = new EngineRequest(
                "1.0",
                "run_readiness",
                "/tmp/demo-repo",
                new FeatureSpec(
                        "1.0",
                        UUID.randomUUID(),
                        "My feature",
                        "Do the thing",
                        List.of(),
                        List.of(),
                        List.of(),
                        Instant.now(),
                        Instant.now()),
                null);

        EngineResponse response = new MockReadinessRunner().handle(request);

        assertNotNull(response.report().repairPrompt());
        assertEquals(true, response.report().repairPrompt().contains("My feature"));
    }

    @Test
    void returnsErrorForUnknownRequestField() throws Exception {
        EngineResponse response = mapper.readValue(
                runner.handleJson("""
                        {
                          "protocolVersion":"1.0",
                          "command":"run_readiness",
                          "repoPath":"/tmp/repo",
                          "unexpectedField":"value"
                        }
                        """),
                EngineResponse.class);

        assertEquals("error", response.status());
        assertEquals("INVALID_JSON", response.error().code());
    }

    @Test
    void returnsStructuredInternalErrorWhenHandlerThrows() throws Exception {
        EngineRunner failingRunner = new EngineRunner(
                JsonMapperFactory.create(),
                request -> {
                    throw new IllegalStateException("boom");
                });

        EngineResponse response = mapper.readValue(
                failingRunner.handleJson("""
                        {"protocolVersion":"1.0","command":"run_readiness","repoPath":"/tmp/repo"}
                        """),
                EngineResponse.class);

        assertEquals("error", response.status());
        assertEquals("INTERNAL", response.error().code());
    }
}
