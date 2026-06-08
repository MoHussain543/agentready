import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import type { EngineRequest, EngineResponse, ReadinessReport } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function resolveJar(): string {
  if (process.env.AGENTREADY_ENGINE_JAR) {
    return process.env.AGENTREADY_ENGINE_JAR;
  }
  // Dev monorepo path (apps/mcp/dist/../../../engine/target/)
  const devJar = join(__dirname, "..", "..", "..", "engine", "target", "agentready-engine.jar");
  if (existsSync(devJar)) return devJar;
  // macOS desktop app bundle
  const appJar = `${process.env.HOME ?? ""}/Applications/AgentReady.app/Contents/Resources/agentready-engine.jar`;
  if (existsSync(appJar)) return appJar;
  // Bundled with npm package (published releases)
  const bundled = join(__dirname, "..", "bin", "agentready-engine.jar");
  if (existsSync(bundled)) return bundled;

  throw new Error(
    "Cannot locate agentready-engine.jar.\n" +
    "Options:\n" +
    "  1. Set AGENTREADY_ENGINE_JAR=/path/to/agentready-engine.jar\n" +
    "  2. Install the AgentReady desktop app (the JAR is bundled inside it)\n" +
    "  3. Build from source: cd engine && mvn package"
  );
}

export function resolveJava(): string {
  if (process.env.AGENTREADY_JAVA) return process.env.AGENTREADY_JAVA;
  if (process.env.JAVA_HOME) return join(process.env.JAVA_HOME, "bin", "java");
  return "java";
}

export function runEngine(request: EngineRequest): ReadinessReport {
  const jar = resolveJar();
  const java = resolveJava();

  const result = spawnSync(java, ["-jar", jar], {
    input: JSON.stringify(request),
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    timeout: 60_000,
  });

  if (result.error) {
    const isEnoent = (result.error as NodeJS.ErrnoException).code === "ENOENT";
    throw new Error(
      isEnoent
        ? `Java not found. Install a JDK or set AGENTREADY_JAVA to the java binary path.`
        : `Failed to start engine: ${result.error.message}`
    );
  }

  if (result.status !== 0) {
    const stderr = result.stderr?.trim() ?? "";
    throw new Error(`Engine exited with code ${result.status}.${stderr ? ` ${stderr}` : ""}`);
  }

  const stdout = result.stdout?.trim() ?? "";
  if (!stdout) {
    throw new Error("Engine produced no output. Check that Java can run the JAR.");
  }

  let response: EngineResponse;
  try {
    response = JSON.parse(stdout) as EngineResponse;
  } catch {
    throw new Error(`Failed to parse engine output: ${stdout.slice(0, 300)}`);
  }

  if (response.status !== "ok" || !response.report) {
    const msg = response.error?.message ?? "Engine returned an error";
    throw new Error(`${response.error?.code ?? "ENGINE_ERROR"}: ${msg}`);
  }

  return response.report;
}
