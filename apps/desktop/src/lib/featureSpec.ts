import type { FeatureSessionInput } from "../types";
import type { FeatureSpec } from "../types/engine";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "should",
  "that",
  "the",
  "this",
  "to",
  "when",
  "with",
]);

const RISK_TERMS = [
  "auth",
  "authentication",
  "authorization",
  "payment",
  "migration",
  "password",
  "secret",
  "credential",
  "admin",
  "delete",
  "security",
  "token",
  "api key",
];

export function buildFeatureSpec(
  session: FeatureSessionInput,
  previousSpec?: FeatureSpec | null,
): FeatureSpec {
  const title = session.title.trim();
  const description = session.description.trim();
  const combined = `${title} ${description}`;
  const now = new Date().toISOString();

  return {
    schemaVersion: "1.0",
    id: previousSpec?.id ?? crypto.randomUUID(),
    title,
    originalFeatureDescription: description,
    expectedKeywords: extractExpectedKeywords(title, description),
    expectedStatusCodes: extractExpectedStatusCodes(combined),
    riskKeywords: extractRiskKeywords(combined),
    createdAt: previousSpec?.createdAt ?? now,
    updatedAt: now,
  };
}

export function sessionInputFromSpec(spec: FeatureSpec): FeatureSessionInput {
  return {
    title: spec.title,
    description: spec.originalFeatureDescription,
  };
}

export function extractExpectedStatusCodes(text: string): number[] {
  const matches = text.matchAll(/\b([1-5]\d{2})\b/g);
  const codes = [...matches].map((match) => Number.parseInt(match[1], 10));
  return [...new Set(codes)].sort((a, b) => a - b);
}

export function extractExpectedKeywords(
  title: string,
  description: string,
): string[] {
  const tokens = `${title} ${description}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

  const titleTokens = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 0);

  return [...new Set([...titleTokens, ...tokens])];
}

export function extractRiskKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return RISK_TERMS.filter((term) => lower.includes(term));
}
