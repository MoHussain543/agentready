import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { jwtVerify } from "jose";

const MODEL = "claude-haiku-4-5-20251001";

const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(20, "1 h"),
      })
    : null;

interface ContextForgeRequest {
  projectName: string;
  languages: string[];
  frameworks: string[];
  buildTools: string[];
  databases: string[];
  testFrameworks: string[];
  hasDocker: boolean;
  hasMigrations: boolean;
}

interface ContextForgeResponse {
  cursorrules: string;
  agentsMd: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers["x-agentready-token"];
  const expectedToken = process.env.AGENTREADY_TOKEN;
  if (!expectedToken || token !== expectedToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userToken = req.headers["x-agentready-user-token"];
  const jwtSecret = process.env.AGENTREADY_JWT_SECRET;
  if (!jwtSecret) return res.status(500).json({ error: "Service not configured" });
  if (!userToken || typeof userToken !== "string") {
    return res.status(401).json({ error: "Sign in to generate context files." });
  }

  let userClaims: { sub: string; pro: boolean };
  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(userToken, secret);
    userClaims = payload as { sub: string; pro: boolean };
  } catch {
    return res.status(401).json({ error: "Invalid or expired session. Sign in again." });
  }

  if (!userClaims.pro) {
    return res.status(403).json({ error: "ContextForge requires a Pro subscription." });
  }

  if (ratelimit) {
    const { success } = await ratelimit.limit(`contextforge:${userClaims.sub}`);
    if (!success) return res.status(429).json({ error: "Too many requests. Try again in an hour." });
  }

  const body = req.body as ContextForgeRequest;
  if (!body?.projectName || !Array.isArray(body?.languages)) {
    return res.status(400).json({ error: "Missing projectName or languages" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Service not configured" });

  const stackLines = [
    `Project: ${body.projectName}`,
    body.languages.length > 0 ? `Languages: ${body.languages.join(", ")}` : null,
    body.frameworks.length > 0 ? `Frameworks: ${body.frameworks.join(", ")}` : null,
    body.buildTools.length > 0 ? `Build tools: ${body.buildTools.join(", ")}` : null,
    body.databases.length > 0 ? `Databases: ${body.databases.join(", ")}` : null,
    body.testFrameworks.length > 0 ? `Test frameworks: ${body.testFrameworks.join(", ")}` : null,
    body.hasDocker ? "Infrastructure: Docker / docker-compose" : null,
    body.hasMigrations ? "Database migrations: yes" : null,
  ].filter(Boolean).join("\n");

  const systemPrompt =
    "You are an expert software engineer writing AI coding assistant configuration files.\n" +
    "Generate a .cursorrules file and an AGENTS.md file for the described project stack.\n\n" +
    ".cursorrules: plain-text rules for AI coding assistants. Cover stack conventions, patterns to follow, " +
    "common pitfalls to avoid, testing requirements, and security rules. Be specific and opinionated. " +
    "10–20 rules. No YAML, no frontmatter — plain readable text.\n\n" +
    "AGENTS.md: Markdown document with sections: ## Stack, ## Conventions, ## Rules, ## Testing. " +
    "Same content as .cursorrules but structured for Claude/GPT agents.\n\n" +
    "Respond ONLY with valid JSON — no markdown fences:\n" +
    '{"cursorrules":"...","agentsMd":"..."}';

  let message;
  try {
    const client = new Anthropic({ apiKey });
    message = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: stackLines }],
    });
  } catch (err) {
    console.error("[contextforge] Anthropic error:", err);
    return res.status(502).json({ error: "AI service error" });
  }

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return res.status(502).json({ error: "Unexpected response from AI" });
  }

  const rawText = textBlock.text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  let parsed: ContextForgeResponse;
  try {
    parsed = JSON.parse(rawText) as ContextForgeResponse;
  } catch {
    console.error("[contextforge] JSON parse error. Raw:", rawText);
    return res.status(502).json({ error: "AI returned invalid JSON" });
  }

  return res.status(200).json(parsed);
}
