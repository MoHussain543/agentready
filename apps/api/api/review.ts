import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const MODEL = "claude-haiku-4-5-20251001";

const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(20, "1 h"),
      })
    : null;
const MAX_FILES = 50;
const MAX_LINES = 5000;

interface ReviewRequest {
  featureRequest: string;
  changedFiles: string[];
  totalChangedLines: number;
  freeFindings: string[];
}

interface ReviewResponse {
  aligned: boolean;
  confidence: "high" | "medium" | "low";
  summary: string;
  unrelatedFiles: string[];
  scopeCreep: string[];
  misleadingCopy: string[];
  suggestedFixes: string[];
}

async function verifyUserToken(userToken: string, jwtSecret: string) {
  const { jwtVerify } = await import("jose");
  const secret = new TextEncoder().encode(jwtSecret);
  const { payload } = await jwtVerify(userToken, secret);
  return payload as { sub: string; pro: boolean };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Validate the desktop app token to prevent unauthorized use
  const token = req.headers["x-agentready-token"];
  const expectedToken = process.env.AGENTREADY_TOKEN;
  if (!expectedToken || token !== expectedToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Verify user JWT — confirms the user has an active AgentReady account
  const userToken = req.headers["x-agentready-user-token"];
  const jwtSecret = process.env.AGENTREADY_JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ error: "Service not configured" });
  }
  if (!userToken || typeof userToken !== "string") {
    return res.status(401).json({ error: "User authentication required" });
  }
  let userClaims: { sub: string; pro: boolean };
  try {
    userClaims = await verifyUserToken(userToken, jwtSecret);
  } catch {
    return res.status(401).json({ error: "Invalid or expired session. Sign in again." });
  }
  if (!userClaims.pro) {
    return res.status(403).json({ error: "Pro subscription required for AI review." });
  }

  // Rate limit by user ID — 20 reviews per hour per subscriber
  if (!ratelimit) {
    return res.status(500).json({ error: "Service not configured" });
  }
  const { success } = await ratelimit.limit(userClaims.sub);
  if (!success) {
    return res.status(429).json({ error: "Too many requests. Try again in an hour." });
  }

  const body = req.body as ReviewRequest;

  if (!body?.featureRequest || !Array.isArray(body?.changedFiles)) {
    return res.status(400).json({ error: "Missing featureRequest or changedFiles" });
  }
  if (body.featureRequest.length > 2000) {
    return res.status(400).json({ error: "featureRequest exceeds maximum length" });
  }

  if (body.changedFiles.length > MAX_FILES || body.totalChangedLines > MAX_LINES) {
    return res.status(400).json({
      error: `Diff too large (${body.changedFiles.length} files, ${body.totalChangedLines} lines). Limit: ${MAX_FILES} files / ${MAX_LINES} lines.`,
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Service not configured" });
  }

  const client = new Anthropic({ apiKey });

  const userContent = JSON.stringify({
    featureRequest: body.featureRequest,
    changedFiles: body.changedFiles,
    totalChangedLines: body.totalChangedLines,
    freeFindings: body.freeFindings ?? [],
  });

  const systemPrompt =
    "You are a code reviewer. Analyze whether the changed files match the requested feature.\n" +
    "Respond ONLY with valid JSON — no markdown, no code fences, no explanation:\n" +
    '{"aligned":bool,"confidence":"high"|"medium"|"low","summary":"one sentence","unrelatedFiles":[],"scopeCreep":[],"misleadingCopy":[],"suggestedFixes":[]}';

  let message;
  try {
    message = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });
  } catch (err) {
    console.error("[review] Anthropic API error:", err);
    return res.status(502).json({ error: "AI service error", detail: String(err) });
  }

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return res.status(502).json({ error: "Unexpected response from AI" });
  }

  const rawText = textBlock.text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  let parsed: ReviewResponse;
  try {
    parsed = JSON.parse(rawText) as ReviewResponse;
  } catch {
    console.error("[review] JSON parse error. Raw text:", rawText);
    return res.status(502).json({ error: "AI returned invalid JSON" });
  }

  return res.status(200).json(parsed);
}
