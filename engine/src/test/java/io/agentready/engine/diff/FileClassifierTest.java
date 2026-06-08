package io.agentready.engine.diff;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FileClassifierTest {

    private final FileClassifier classifier = new FileClassifier();

    @Test
    void detectsTestFiles() {
        assertTrue(classifier.isTestFile("src/test/java/com/UserTest.java"));
        assertTrue(classifier.isTestFile("pkg/user_test.go"));
        assertTrue(classifier.isTestFile("src/components/Button.test.tsx"));
        assertTrue(classifier.isTestFile("spec/models/user_spec.rb"));
        assertTrue(classifier.isTestFile("__tests__/foo.js"));

        assertFalse(classifier.isTestFile("src/main/latest.js"));
        assertFalse(classifier.isTestFile("src/main/User.java"));
    }

    @Test
    void detectsProductionSource() {
        assertTrue(classifier.isProductionSource("src/main/User.java"));
        assertTrue(classifier.isProductionSource("app/handler.ts"));
        assertFalse(classifier.isProductionSource("src/test/UserTest.java"));
        assertFalse(classifier.isProductionSource("README.md"));
    }

    @Test
    void detectsEnvFiles() {
        assertTrue(classifier.isEnvFile(".env"));
        assertTrue(classifier.isEnvFile(".env.local"));
        assertTrue(classifier.isEnvFile("config/prod.env"));
        assertFalse(classifier.isEnvFile("environment.ts"));
    }

    @Test
    void detectsDependencyManifests() {
        assertTrue(classifier.isDependencyManifest("package.json"));
        assertTrue(classifier.isDependencyManifest("apps/desktop/package-lock.json"));
        assertTrue(classifier.isDependencyManifest("Cargo.lock"));
        assertTrue(classifier.isDependencyManifest("go.mod"));
        assertFalse(classifier.isDependencyManifest("src/config.json"));
    }

    @Test
    void detectsCiAndMigrationFiles() {
        assertTrue(classifier.isCiOrDeployFile(".github/workflows/ci.yml"));
        assertTrue(classifier.isCiOrDeployFile("Dockerfile"));
        assertTrue(classifier.isCiOrDeployFile("infra/main.tf"));
        assertTrue(classifier.isMigrationFile("db/migrate/001_init.sql"));
        assertTrue(classifier.isMigrationFile("migrations/0001_users.py"));
    }

    @Test
    void detectsStyleFiles() {
        assertTrue(classifier.isStyleFile("src/styles/main.css"));
        assertTrue(classifier.isStyleFile("components/Button.scss"));
        assertTrue(classifier.isStyleFile("src/theme.less"));
        assertTrue(classifier.isStyleFile("src/app.sass"));

        assertFalse(classifier.isStyleFile("src/components/Button.tsx"));
        assertFalse(classifier.isStyleFile("README.md"));
        assertFalse(classifier.isStyleFile("src/App.java"));
    }

    @Test
    void detectsIgnoredInternalAndGeneratedArtifacts() {
        assertTrue(classifier.isAgentReadyInternal(".agentready/session.json"));
        assertTrue(classifier.isGeneratedArtifact("apps/desktop/src-tauri/gen/schemas/desktop-schema.json"));
        assertTrue(classifier.isIgnoredForReadiness(".agentready/feature-spec.json"));
        assertTrue(classifier.isIgnoredForReadiness("src-tauri/gen/schemas/capabilities.json"));
        assertFalse(classifier.isIgnoredForReadiness("src/main/User.java"));
    }

    @Test
    void doesNotTreatGenericSessionUiFilesAsRisky() {
        assertFalse(classifier.isRiskyPath("apps/desktop/src/views/StartSessionView.tsx"));
        assertTrue(classifier.isRiskyPath("src/auth/session_store.go"));
    }

    @Test
    void classifyReturnsPrimaryCategory() {
        assertEquals(FileCategory.TEST, classifier.classify("src/UserTest.java"));
        assertEquals(FileCategory.DEPENDENCY, classifier.classify("package.json"));
        assertEquals(FileCategory.CI, classifier.classify(".github/workflows/ci.yml"));
        assertEquals(FileCategory.ENV, classifier.classify(".env.production"));
        assertEquals(FileCategory.CONFIG, classifier.classify("tsconfig.json"));
        assertEquals(FileCategory.DOCS, classifier.classify("docs/architecture.md"));
        assertEquals(FileCategory.STYLE, classifier.classify("src/styles/main.css"));
        assertEquals(FileCategory.STYLE, classifier.classify("components/Button.scss"));
        assertEquals(FileCategory.SOURCE, classifier.classify("src/main/User.java"));
        assertEquals(FileCategory.RISKY, classifier.classify("src/auth/session_store.go"));
        assertEquals(FileCategory.OTHER, classifier.classify("assets/logo.png"));
    }
}
