package io.agentready.engine.cli;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.agentready.engine.json.JsonMapperFactory;
import io.agentready.engine.model.EngineError;
import io.agentready.engine.model.EngineRequest;
import io.agentready.engine.model.EngineResponse;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public final class EngineRunner {

    private final ObjectMapper mapper;
    private final EngineHandler handler;

    public EngineRunner() {
        this(JsonMapperFactory.create(), new ReadinessRunner());
    }

    EngineRunner(ObjectMapper mapper, EngineHandler handler) {
        this.mapper = mapper;
        this.handler = handler;
    }

    public EngineResponse handle(EngineRequest request) {
        return handler.handle(request);
    }

    public String handleJson(String requestJson) throws JsonProcessingException {
        EngineRequest request;
        try {
            request = mapper.readValue(requestJson, EngineRequest.class);
        } catch (JsonProcessingException e) {
            EngineResponse response = EngineResponse.error("1.0",
                    new EngineError("INVALID_JSON", "Request could not be parsed"));
            return mapper.writeValueAsString(response);
        }

        try {
            return mapper.writeValueAsString(handler.handle(request));
        } catch (Exception e) {
            EngineResponse response = EngineResponse.error(
                    request.protocolVersion() == null ? "1.0" : request.protocolVersion(),
                    new EngineError("INTERNAL", "Unexpected engine failure"));
            return mapper.writeValueAsString(response);
        }
    }

    public static String readInput(InputStream in) throws IOException {
        return new String(in.readAllBytes(), StandardCharsets.UTF_8).trim();
    }
}
