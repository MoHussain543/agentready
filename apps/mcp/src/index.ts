#!/usr/bin/env node
import { randomUUID } from "crypto";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { runEngine } from "./engine.js";
import { runProReview } from "./proReview.js";
import { readLatestReport } from "./storage.js";
import { formatReport } from "./format.js";
import type { EngineRequest } from "./types.js";

const server = new Server(
  { name: "agentready", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "run_readiness_check",
      description:
        "Run a pre-commit readiness check on a git repository. Analyzes uncommitted changes " +
        "against a feature description and returns a pass/warn/fail verdict with a repair prompt. " +
        "Pro users also receive an AI alignment review.",
      inputSchema: {
        type: "object",
        properties: {
          repo_path: {
            type: "string",
            description: "Absolute path to the git repository root.",
          },
          feature_description: {
            type: "string",
            description:
              "What you asked the AI to build — e.g. 'add 404 response for missing users in the API'.",
          },
        },
        required: ["repo_path", "feature_description"],
      },
    },
    {
      name: "get_latest_report",
      description:
        "Retrieve the latest saved readiness check report for a repository without running a new check.",
      inputSchema: {
        type: "object",
        properties: {
          repo_path: {
            type: "string",
            description: "Absolute path to the git repository root.",
          },
        },
        required: ["repo_path"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "run_readiness_check") {
      const repoPath = String(args?.repo_path ?? "").trim();
      const featureDescription = String(args?.feature_description ?? "").trim();
      if (!repoPath) throw new Error("repo_path is required.");
      if (!featureDescription) throw new Error("feature_description is required.");

      const now = new Date().toISOString();
      const title = featureDescription.split("\n")[0].slice(0, 120);
      const keywords = [...new Set(featureDescription.toLowerCase().match(/\b[a-z]{4,}\b/g) ?? [])].slice(0, 20);

      const engineRequest: EngineRequest = {
        protocolVersion: "1.0",
        command: "run_readiness",
        repoPath,
        featureSpec: {
          schemaVersion: "1.0",
          id: randomUUID(),
          title,
          originalFeatureDescription: featureDescription,
          expectedKeywords: keywords,
          expectedStatusCodes: [],
          riskKeywords: [],
          createdAt: now,
          updatedAt: now,
        },
        options: {
          checkSuite: "free-v1-precommit",
          includeStaged: true,
          includeUnstaged: true,
          runTests: false,
        },
      };

      const report = runEngine(engineRequest);

      const userToken = process.env.AGENTREADY_USER_TOKEN;
      if (userToken) {
        await runProReview(report, userToken, featureDescription);
      }

      return { content: [{ type: "text" as const, text: formatReport(report, featureDescription) }] };
    }

    if (name === "get_latest_report") {
      const repoPath = String(args?.repo_path ?? "").trim();
      if (!repoPath) throw new Error("repo_path is required.");

      const report = readLatestReport(repoPath);
      if (!report) {
        return {
          content: [{
            type: "text" as const,
            text: "No saved report found for this repository. Run `run_readiness_check` first.",
          }],
        };
      }

      return { content: [{ type: "text" as const, text: formatReport(report) }] };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Error: ${message}` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
