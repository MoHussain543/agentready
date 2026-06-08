package io.agentready.engine.rules;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.agentready.engine.json.JsonMapperFactory;
import io.agentready.engine.model.ChangedFile;
import io.agentready.engine.model.Evidence;
import io.agentready.engine.model.EvidenceKind;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Warns when added JS/TS imports reference a bare package that is not declared in the nearest
 * package manifest.
 */
public final class MissingManifestDependencyRule implements Rule {

    private static final ObjectMapper MAPPER = JsonMapperFactory.create();

    private static final Pattern IMPORT_PATTERN = Pattern.compile(
            "(?:import\\s+(?:[^;]*?\\s+from\\s+)?|require\\s*\\(|import\\s*\\()"
                    + "[\"']([^\"']+)[\"']");

    private static final Set<String> JS_TS_EXTENSIONS = Set.of("js", "jsx", "ts", "tsx", "mjs", "cjs");
    private static final Set<String> NODE_BUILTINS = Set.of(
            "assert", "buffer", "child_process", "crypto", "events", "fs", "http", "https",
            "os", "path", "stream", "timers", "url", "util", "zlib");

    @Override
    public String id() {
        return "missing-manifest-dependency";
    }

    @Override
    public String name() {
        return "Missing manifest dependency";
    }

    @Override
    public RuleResult evaluate(RuleContext context) {
        Map<Path, Set<String>> manifestCache = new HashMap<>();
        List<Evidence> evidence = new ArrayList<>();

        Path repo = Path.of(context.repoPath());
        for (ChangedFile file : context.diffProfile().productionFiles()) {
            if (!isJavaScriptLike(file.path())) {
                continue;
            }

            Path manifestPath = nearestPackageJson(repo, file.path());
            Set<String> declared = manifestPath == null
                    ? Set.of()
                    : manifestCache.computeIfAbsent(manifestPath, MissingManifestDependencyRule::readDeclaredPackages);

            Set<String> missing = new LinkedHashSet<>();
            for (String line : context.addedLines(file.path())) {
                Matcher matcher = IMPORT_PATTERN.matcher(line);
                while (matcher.find()) {
                    String specifier = matcher.group(1);
                    String packageName = packageName(specifier);
                    if (packageName != null && !declared.contains(packageName)) {
                        missing.add(packageName);
                    }
                }
            }

            if (!missing.isEmpty()) {
                evidence.add(new Evidence(EvidenceKind.file, file.path(), String.join(", ", missing)));
            }
        }

        if (evidence.isEmpty()) {
            return RuleResult.pass("No added imports appear to require undeclared packages", List.of());
        }
        if (evidence.size() == 1) {
            Evidence hit = evidence.get(0);
            return RuleResult.warn(
                    "Added import appears to require an undeclared package: " + hit.detail(),
                    "Add the missing dependency to the nearest package.json or remove the undeclared import before committing.",
                    evidence);
        }
        return RuleResult.warn(
                evidence.size() + " file(s) import package(s) missing from the nearest package manifest",
                "Add the missing dependencies to the nearest package.json or remove the undeclared imports before committing.",
                evidence);
    }

    private static boolean isJavaScriptLike(String path) {
        String lower = path.toLowerCase(Locale.ROOT);
        int dot = lower.lastIndexOf('.');
        return dot >= 0 && JS_TS_EXTENSIONS.contains(lower.substring(dot + 1));
    }

    private static String packageName(String specifier) {
        if (specifier == null || specifier.isBlank()) {
            return null;
        }
        String lower = specifier.toLowerCase(Locale.ROOT);
        if (lower.startsWith(".")
                || lower.startsWith("/")
                || lower.startsWith("#")
                || lower.startsWith("~/")
                || lower.startsWith("@/")
                || lower.startsWith("node:")) {
            return null;
        }
        String[] parts = specifier.split("/");
        String root = specifier.startsWith("@")
                ? (parts.length >= 2 ? parts[0] + "/" + parts[1] : specifier)
                : parts[0];
        return NODE_BUILTINS.contains(root) ? null : root;
    }

    private static Path nearestPackageJson(Path repo, String filePath) {
        Path current = repo.resolve(filePath).normalize().getParent();
        while (current != null && current.startsWith(repo)) {
            Path candidate = current.resolve("package.json");
            if (Files.isRegularFile(candidate)) {
                return candidate;
            }
            if (current.equals(repo)) {
                break;
            }
            current = current.getParent();
        }
        return Files.isRegularFile(repo.resolve("package.json")) ? repo.resolve("package.json") : null;
    }

    private static Set<String> readDeclaredPackages(Path manifestPath) {
        if (manifestPath == null || !Files.isRegularFile(manifestPath)) {
            return Set.of();
        }
        try {
            JsonNode root = MAPPER.readTree(Files.readString(manifestPath));
            Set<String> packages = new HashSet<>();
            collectKeys(root.get("dependencies"), packages);
            collectKeys(root.get("devDependencies"), packages);
            collectKeys(root.get("peerDependencies"), packages);
            collectKeys(root.get("optionalDependencies"), packages);
            return packages;
        } catch (IOException e) {
            return Set.of();
        }
    }

    private static void collectKeys(JsonNode node, Set<String> packages) {
        if (node == null || !node.isObject()) {
            return;
        }
        node.fieldNames().forEachRemaining(packages::add);
    }
}
