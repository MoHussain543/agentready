package io.agentready.engine.rules;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SecretScannerTest {

    @Test
    void flagsLikelySecrets() {
        assertTrue(SecretScanner.looksLikeSecret("api_key = \"AKIA1234567890ABCDEFGH\""));
        assertTrue(SecretScanner.looksLikeSecret("password: hunter2pwd"));
        assertTrue(SecretScanner.looksLikeSecret("Authorization: Bearer abcdef0123456789ABCDEF01"));
        assertTrue(SecretScanner.looksLikeSecret("-----BEGIN PRIVATE KEY-----"));
    }

    @Test
    void ignoresPlaceholdersAndIndirection() {
        assertFalse(SecretScanner.looksLikeSecret("api_key = \"\""));
        assertFalse(SecretScanner.looksLikeSecret("password = changeme"));
        assertFalse(SecretScanner.looksLikeSecret("token = process.env.TOKEN"));
        assertFalse(SecretScanner.looksLikeSecret("secret = ${VAULT_SECRET}"));
        assertFalse(SecretScanner.looksLikeSecret("const userName = \"alice\";"));
        assertFalse(SecretScanner.looksLikeSecret("// just a comment about tokens"));
    }
}
