import type { FeatureSessionInput } from "../types";
import type { FeatureSpec } from "../types/engine";

const STOP_WORDS = new Set([
  "add",
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "change",
  "changes",
  "commit",
  "current",
  "describe",
  "do",
  "for",
  "file",
  "files",
  "from",
  "in",
  "is",
  "it",
  "keep",
  "local",
  "locally",
  "make",
  "latest",
  "of",
  "on",
  "or",
  "original",
  "polish",
  "reopen",
  "requested",
  "request",
  "review",
  "show",
  "should",
  "that",
  "the",
  "this",
  "unrelated",
  "use",
  "using",
  "your",
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

const MAX_EXPECTED_KEYWORDS = 12;

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
  const meaningful = (text: string): string[] =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(
        (token) =>
          token.length > 2 &&
          !STOP_WORDS.has(token) &&
          !/^\d+$/.test(token),
      );

  // Title terms first (they tend to be the most important), then description terms.
  return [...new Set([...meaningful(title), ...meaningful(description)])].slice(
    0,
    MAX_EXPECTED_KEYWORDS,
  );
}

export function extractRiskKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return RISK_TERMS.filter((term) => lower.includes(term));
}
