package io.agentready.engine.diff;

import java.util.Set;

/**
 * Heuristic, stack-agnostic file classification based on paths and filenames only.
 *
 * <p>Intentionally conservative and explicit: no content inspection, no language servers.
 * A file may satisfy several predicates; {@link #classify(String)} returns a single primary
 * category using a fixed priority order.
 */
public final class FileClassifier {

    private static final Set<String> SOURCE_EXTENSIONS = Set.of(
            "java", "ts", "tsx", "js", "jsx", "mjs", "cjs", "rs", "go", "py", "rb", "php",
            "c", "cc", "cpp", "cxx", "h", "hpp", "cs", "kt", "kts", "swift", "scala", "m",
            "mm", "vue", "svelte", "dart", "clj", "ex", "exs");

    private static final Set<String> CONFIG_EXTENSIONS = Set.of(
            "yaml", "yml", "toml", "ini", "cfg", "conf", "config", "properties", "xml",
            "json", "json5", "editorconfig", "plist");

    private static final Set<String> DOC_EXTENSIONS = Set.of("md", "mdx", "rst", "adoc");

    private static final Set<String> DEPENDENCY_FILES = Set.of(
            "package.json", "package-lock.json", "npm-shrinkwrap.json", "yarn.lock",
            "pnpm-lock.yaml", "pom.xml", "build.gradle", "build.gradle.kts", "settings.gradle",
            "settings.gradle.kts", "gradle.lockfile", "cargo.toml", "cargo.lock", "go.mod",
            "go.sum", "requirements.txt", "pipfile", "pipfile.lock", "poetry.lock",
            "pyproject.toml", "gemfile", "gemfile.lock", "composer.json", "composer.lock",
            "mix.exs", "mix.lock", "pubspec.yaml", "pubspec.lock");

    private static final Set<String> RISKY_TERMS = Set.of(
            "auth", "login", "password", "secret", "credential", "token", "security",
            "oauth", "session", "crypto", "jwt", "permission", "payment", "billing", "admin");

    /** Returns the single most relevant category for a path. */
    public FileCategory classify(String path) {
        if (isTestFile(path)) {
            return FileCategory.TEST;
        }
        if (isEnvFile(path)) {
            return FileCategory.ENV;
        }
        if (isDependencyManifest(path)) {
            return FileCategory.DEPENDENCY;
        }
        if (isCiOrDeployFile(path)) {
            return FileCategory.CI;
        }
        if (isMigrationFile(path)) {
            return FileCategory.MIGRATION;
        }
        if (isConfigFile(path)) {
            return FileCategory.CONFIG;
        }
        if (isDocsFile(path)) {
            return FileCategory.DOCS;
        }
        if (isRiskyPath(path)) {
            return FileCategory.RISKY;
        }
        if (isSourceCode(path)) {
            return FileCategory.SOURCE;
        }
        return FileCategory.OTHER;
    }

    public boolean isTestFile(String path) {
        String lower = path.toLowerCase();
        if (hasSegment(lower, Set.of("test", "tests", "__tests__", "spec", "specs", "testing"))) {
            return true;
        }
        String name = fileName(path);
        String lname = name.toLowerCase();
        return name.matches(".*(Test|Spec)s?\\.[A-Za-z0-9]+$")
                || lname.matches(".*[._-](test|spec)s?\\.[a-z0-9]+$")
                || lname.matches("(test|spec)[._-].*")
                || lname.contains(".test.")
                || lname.contains(".spec.");
    }

    public boolean isSourceCode(String path) {
        return SOURCE_EXTENSIONS.contains(extension(path));
    }

    public boolean isProductionSource(String path) {
        return isSourceCode(path) && !isTestFile(path);
    }

    public boolean isEnvFile(String path) {
        String name = fileName(path).toLowerCase();
        return name.equals(".env")
                || name.startsWith(".env.")
                || name.endsWith(".env")
                || extension(path).equals("env");
    }

    public boolean isDependencyManifest(String path) {
        return DEPENDENCY_FILES.contains(fileName(path).toLowerCase());
    }

    public boolean isConfigFile(String path) {
        String name = fileName(path).toLowerCase();
        if (CONFIG_EXTENSIONS.contains(extension(path))) {
            return true;
        }
        return name.startsWith(".eslintrc")
                || name.startsWith(".prettierrc")
                || name.startsWith(".babelrc")
                || name.startsWith(".stylelintrc")
                || name.startsWith("tsconfig")
                || name.equals(".editorconfig");
    }

    public boolean isDocsFile(String path) {
        String lower = path.toLowerCase();
        if (DOC_EXTENSIONS.contains(extension(path))) {
            return true;
        }
        if (hasSegment(lower, Set.of("docs", "doc"))) {
            return true;
        }
        String name = fileName(lower);
        return name.startsWith("readme")
                || name.startsWith("license")
                || name.startsWith("changelog")
                || name.startsWith("contributing")
                || name.startsWith("authors")
                || name.startsWith("notice");
    }

    public boolean isCiOrDeployFile(String path) {
        String lower = path.toLowerCase();
        String name = fileName(lower);
        if (lower.contains(".github/workflows/")
                || lower.contains(".circleci/")
                || lower.contains("/deploy/")
                || lower.startsWith("deploy/")
                || lower.contains("helm/")
                || lower.contains("kubernetes")
                || lower.contains("/k8s/")
                || lower.startsWith("k8s/")) {
            return true;
        }
        return name.equals("dockerfile")
                || name.startsWith("docker-compose")
                || name.equals("jenkinsfile")
                || name.equals(".gitlab-ci.yml")
                || name.equals(".travis.yml")
                || name.equals("azure-pipelines.yml")
                || extension(path).equals("tf");
    }

    public boolean isMigrationFile(String path) {
        String lower = path.toLowerCase();
        String name = fileName(lower);
        if (hasSegment(lower, Set.of("migration", "migrations"))
                || lower.contains("db/migrate")
                || lower.contains("alembic/")) {
            return true;
        }
        return extension(path).equals("sql")
                || name.equals("schema.rb")
                || name.matches("v\\d+__.*");
    }

    public boolean isRiskyPath(String path) {
        String lower = path.toLowerCase();
        for (String term : RISKY_TERMS) {
            if (lower.contains(term)) {
                return true;
            }
        }
        return false;
    }

    /**
     * AgentReady's own repo-local bookkeeping should never influence readiness analysis.
     */
    public boolean isAgentReadyInternal(String path) {
        String lower = normalize(path);
        return lower.equals(".agentready")
                || lower.startsWith(".agentready/");
    }

    /**
     * Obvious generated artifacts are low-signal for baseline readiness checks.
     */
    public boolean isGeneratedArtifact(String path) {
        String lower = normalize(path);
        return lower.startsWith("src-tauri/gen/")
                || lower.contains("/src-tauri/gen/")
                || lower.startsWith("gen/schemas/")
                || lower.contains("/gen/schemas/")
                || hasSegment(lower, Set.of("generated"));
    }

    /**
     * Files ignored from baseline readiness analysis to reduce false-noise.
     */
    public boolean isIgnoredForReadiness(String path) {
        return isAgentReadyInternal(path) || isGeneratedArtifact(path);
    }

    private static boolean hasSegment(String lowerPath, Set<String> segments) {
        for (String segment : normalize(lowerPath).split("/")) {
            if (segments.contains(segment)) {
                return true;
            }
        }
        return false;
    }

    private static String normalize(String path) {
        return path.replace('\\', '/').toLowerCase();
    }

    private static String fileName(String path) {
        String normalized = path.replace('\\', '/');
        int slash = normalized.lastIndexOf('/');
        return slash >= 0 ? normalized.substring(slash + 1) : normalized;
    }

    private static String extension(String path) {
        String name = fileName(path);
        int dot = name.lastIndexOf('.');
        return dot >= 0 ? name.substring(dot + 1).toLowerCase() : "";
    }
}
