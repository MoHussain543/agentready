package io.agentready.engine.spec;

import java.util.regex.Pattern;

/**
 * Conservative, stack-agnostic matching of feature-spec expectations against a lowercased
 * search corpus (changed file paths + added diff lines). No code-semantics parsing.
 */
public final class SpecMatcher {

    private SpecMatcher() {}

    /**
     * A keyword matches when its normalized form appears as a substring of the corpus, or when
     * (for multi-word phrases) every meaningful token appears somewhere in the corpus.
     */
    public static boolean containsKeyword(String corpus, String keyword) {
        if (keyword == null || corpus == null) {
            return false;
        }
        String normalized = keyword.toLowerCase().trim();
        if (normalized.isEmpty()) {
            return false;
        }
        if (corpus.contains(normalized)) {
            return true;
        }
        String stemmed = stem(normalized);
        if (stemmed.length() >= 5 && corpus.contains(stemmed)) {
            return true;
        }
        String[] tokens = normalized.split("\\s+");
        if (tokens.length <= 1) {
            return false;
        }
        for (String token : tokens) {
            if (token.length() > 2 && !containsTokenVariant(corpus, token)) {
                return false;
            }
        }
        return true;
    }

    /** A status code matches when it appears as a standalone number in the corpus. */
    public static boolean containsStatusCode(String corpus, int code) {
        if (corpus == null) {
            return false;
        }
        return Pattern.compile("\\b" + code + "\\b").matcher(corpus).find();
    }

    private static boolean containsTokenVariant(String corpus, String token) {
        if (corpus.contains(token)) {
            return true;
        }
        String stemmed = stem(token);
        return stemmed.length() >= 5 && corpus.contains(stemmed);
    }

    private static String stem(String value) {
        String stemmed = value;
        String[] suffixes = {"ations", "ation", "ments", "ment", "tions", "tion", "ings", "ing",
                "ions", "ion", "ers", "er", "ies", "ied", "ed", "es", "s"};
        for (String suffix : suffixes) {
            if (stemmed.endsWith(suffix) && stemmed.length() - suffix.length() >= 4) {
                stemmed = stemmed.substring(0, stemmed.length() - suffix.length());
                break;
            }
        }
        if (stemmed.endsWith("e") && stemmed.length() >= 6) {
            stemmed = stemmed.substring(0, stemmed.length() - 1);
        }
        return stemmed;
    }
}
