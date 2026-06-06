package io.agentready.engine.rules;

import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Conservative hardcoded-secret detection over single lines of added content.
 * Tuned to favor precision (few false positives) over recall.
 */
public final class SecretScanner {

    private static final Pattern KEY_VALUE = Pattern.compile(
            "(?i)(api[_-]?key|secret|client[_-]?secret|access[_-]?token|auth[_-]?token|token"
                    + "|password|passwd|pwd)\\s*[:=]\\s*[\"']?([^\"'\\s]{6,})[\"']?");

    private static final Pattern BEARER = Pattern.compile("(?i)bearer\\s+[A-Za-z0-9._\\-]{20,}");

    private static final Set<String> PLACEHOLDERS = Set.of(
            "null", "none", "nil", "changeme", "change_me", "example", "test", "todo",
            "xxx", "xxxx", "placeholder", "your_token", "your_secret", "your_password");

    private SecretScanner() {}

    public static boolean looksLikeSecret(String line) {
        if (line == null || line.isBlank()) {
            return false;
        }
        if (line.contains("BEGIN RSA PRIVATE KEY") || line.contains("BEGIN PRIVATE KEY")) {
            return true;
        }
        if (BEARER.matcher(line).find()) {
            return true;
        }
        Matcher matcher = KEY_VALUE.matcher(line);
        if (matcher.find()) {
            return isLikelyRealValue(matcher.group(2));
        }
        return false;
    }

    private static boolean isLikelyRealValue(String value) {
        String lower = value.toLowerCase();
        if (PLACEHOLDERS.contains(lower)) {
            return false;
        }
        // Environment/config indirection rather than a literal secret.
        if (lower.contains("env") || value.startsWith("$") || value.startsWith("{{")
                || value.contains("process.env") || value.contains("getenv")
                || value.contains("<") || value.contains("}")) {
            return false;
        }
        // All identical characters (e.g. "******") are not real secrets.
        return value.chars().distinct().count() > 1;
    }
}
