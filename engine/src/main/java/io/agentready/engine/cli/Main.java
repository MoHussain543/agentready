package io.agentready.engine.cli;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Engine entrypoint. Reads one JSON request from stdin or {@code --file} and writes one JSON response to stdout.
 */
public final class Main {

    private Main() {}

    public static void main(String[] args) {
        try {
            String input = readRequestJson(args);
            EngineRunner runner = new EngineRunner();
            String output = runner.handleJson(input);
            System.out.println(output);
        } catch (IOException e) {
            System.err.println("agentready-engine: failed to read input: " + e.getMessage());
            System.exit(1);
        } catch (Exception e) {
            System.err.println("agentready-engine: " + e.getMessage());
            System.exit(1);
        }
    }

    static String readRequestJson(String[] args) throws IOException {
        if (args.length >= 2 && "--file".equals(args[0])) {
            return Files.readString(Path.of(args[1])).trim();
        }
        if (args.length == 1 && !args[0].startsWith("--")) {
            return Files.readString(Path.of(args[0])).trim();
        }
        return EngineRunner.readInput(System.in);
    }
}
