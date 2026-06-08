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
        limiter: Ratelimit.slidingWindow(30, "1 h"),
      })
    : null;

interface NarrateRequest {
  featureTitle: string;
  featureDescription: string;
  verdict: string;
  added: string[];
  modified: string[];
  deleted: string[];
  totalChangedLines: number;
  testStatus?: string;
  proAligned?: boolean;
  proSummary?: string;
}

interface NarrateResponse {
  commitMessage: string;
  prTitle: string;
  prBody: string;
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
  if (!jwtSecret) {
    return res.status(500).json({ error: "Service not configured" });
  }
  if (!userToken || typeof userToken !== "string") {
    return res.status(401).json({ error: "Sign in to generate commit messages." });
  }

  let userClaims: { sub: string; pro: boolean };
  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(userToken, secret);
    userClaims = payload as { sub: string; pro: boolean };
  } catch {
    return res.status(401).json({ error: "Invalid or expired session. Sign in again." });
  }

  if (ratelimit) {
    const { success } = await ratelimit.limit(`narrate:${userClaims.sub}`);
    if (!success) {
      return res.status(429).json({ error: "Too many requests. Try again in an hour." });
    }
  }

  const body = req.body as NarrateRequest;
  if (!body?.featureTitle || !body?.featureDescription) {
    return res.status(400).json({ error: "Missing featureTitle or featureDescription" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Service not configured" });
  }

  const changedFiles = [
    ...body.added.map((f) => `+ ${f}`),
    ...body.modified.map((f) => `~ ${f}`),
    ...body.deleted.map((f) => `- ${f}`),
  ];

  const contextLines: string[] = [
    `Feature: ${body.featureTitle}`,
    `Description: ${body.featureDescription}`,
    `Verdict: ${body.verdict}`,
    `Files changed (${body.totalChangedLines} lines):`,
    ...changedFiles.slice(0, 40),
  ];
  if (body.testStatus) contextLines.push(`Tests: ${body.testStatus}`);
  if (body.proAligned !== undefined) contextLines.push(`AI alignment: ${body.proAligned ? "aligned" : "not aligned"}`);
  if (body.proSummary) contextLines.push(`Alignment summary: ${body.proSummary}`);

  const systemPrompt =
    "You are an expert software engineer writing git commit messages and pull request descriptions.\n" +
    "Write a conventional commit message (feat/fix/refactor/etc) and a concise PR description based on the provided context.\n" +
    "The commit message subject line must be under 72 characters. Include a blank line then 2-4 bullet body lines.\n" +
    "The PR body should have ## Summary (2-3 bullets), ## Changes (file-level bullets), and ## Notes if relevant.\n" +
    "Respond ONLY with valid JSON — no markdown fences:\n" +
    '{"commitMessage":"subject\\n\\n- bullet\\n- bullet","prTitle":"short title under 70 chars","prBody":"## Summary\\n\\n..."}';

  let message;
  try {
    const client = new Anthropic({ apiKey });
    message = await client.messages.create({
      model: MODEL,
      max_tokens: 768,
      system: systemPrompt,
      messages: [{ role: "user", content: contextLines.join("\n") }],
    });
  } catch (err) {
    console.error("[narrate] Anthropic API error:", err);
    return res.status(502).json({ error: "AI service error" });
  }

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return res.status(502).json({ error: "Unexpected response from AI" });
  }

  const rawText = textBlock.text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  let parsed: NarrateResponse;
  try {
    parsed = JSON.parse(rawText) as NarrateResponse;
  } catch {
    console.error("[narrate] JSON parse error. Raw text:", rawText);
    return res.status(502).json({ error: "AI returned invalid JSON" });
  }

  return res.status(200).json(parsed);
}
