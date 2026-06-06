package io.agentready.engine.cli;

import io.agentready.engine.model.EngineRequest;
import io.agentready.engine.model.EngineResponse;

@FunctionalInterface
interface EngineHandler {

    EngineResponse handle(EngineRequest request);
}
