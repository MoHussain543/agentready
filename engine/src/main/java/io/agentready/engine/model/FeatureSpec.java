package io.agentready.engine.model;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record FeatureSpec(
        String schemaVersion,
        UUID id,
        String title,
        String originalFeatureDescription,
        List<String> expectedKeywords,
        List<Integer> expectedStatusCodes,
        List<String> riskKeywords,
        Instant createdAt,
        Instant updatedAt) {

    public FeatureSpec {
        expectedKeywords = expectedKeywords == null ? List.of() : List.copyOf(expectedKeywords);
        expectedStatusCodes = expectedStatusCodes == null ? List.of() : List.copyOf(expectedStatusCodes);
        riskKeywords = riskKeywords == null ? List.of() : List.copyOf(riskKeywords);
    }
}
