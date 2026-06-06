package io.agentready.engine.spec;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SpecMatcherTest {

    private static final String CORPUS =
            "src/checkout/paymentcart.java\nreturn responseentity.status(404).build();\n"
                    + "user authentication flow added\n";

    @Test
    void matchesSingleWordKeywords() {
        assertTrue(SpecMatcher.containsKeyword(CORPUS, "checkout"));
        assertTrue(SpecMatcher.containsKeyword(CORPUS, "Payment"));
        assertFalse(SpecMatcher.containsKeyword(CORPUS, "refund"));
    }

    @Test
    void matchesMultiWordPhraseByTokens() {
        assertTrue(SpecMatcher.containsKeyword(CORPUS, "user authentication"));
        assertFalse(SpecMatcher.containsKeyword(CORPUS, "user logout"));
    }

    @Test
    void matchesStandaloneStatusCodes() {
        assertTrue(SpecMatcher.containsStatusCode(CORPUS, 404));
        assertFalse(SpecMatcher.containsStatusCode(CORPUS, 410));
        assertFalse(SpecMatcher.containsStatusCode("error code 4040 here", 404));
    }
}
