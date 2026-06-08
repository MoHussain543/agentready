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

  // Rate limit by IP — 20 reviews per hour per user (skipped if Upstash is not configured)
  if (ratelimit) {
    const ip =
      (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0].trim() ??
      "unknown";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return res.status(429).json({ error: "Too many requests. Try again in an hour." });
    }
  }

  const body = req.body as ReviewRequest;

  if (!body?.featureRequest || !Array.isArray(body?.changedFiles)) {
    return res.status(400).json({ error: "Missing featureRequest or changedFiles" });
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
