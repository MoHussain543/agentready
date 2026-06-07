import type { Verdict } from "../types";
import type { CurrentSession } from "./storage";

const STORAGE_KEY = "agentready.recentProjects";
const MAX_RECENT_PROJECTS = 12;

export interface RecentProjectEntry {
  repoPath: string;
  repoName: string;
  lastOpenedAt: string;
  lastCheckedAt?: string | null;
  latestVerdict?: Verdict | null;
  latestReportPath?: string | null;
  reportHistoryCount?: number | null;
}

function safeRead(): RecentProjectEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isRecentProjectEntry);
  } catch {
    return [];
  }
}

function safeWrite(entries: RecentProjectEntry[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_RECENT_PROJECTS)));
}

function isRecentProjectEntry(value: unknown): value is RecentProjectEntry {
  if (!value || typeof value !== "object") {
    return false;
  }
  const entry = value as Record<string, unknown>;
  return typeof entry.repoPath === "string" && typeof entry.repoName === "string";
}

function recencyValue(entry: RecentProjectEntry): number {
  const value = entry.lastCheckedAt ?? entry.lastOpenedAt;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function loadRecentProjects(): RecentProjectEntry[] {
  return safeRead().sort((a, b) => recencyValue(b) - recencyValue(a));
}

export function saveRecentProjects(entries: RecentProjectEntry[]) {
  const deduped = new Map<string, RecentProjectEntry>();
  for (const entry of entries) {
    deduped.set(entry.repoPath, entry);
  }
  safeWrite(
    Array.from(deduped.values()).sort((a, b) => recencyValue(b) - recencyValue(a)),
  );
}

export function upsertRecentProject(entry: RecentProjectEntry) {
  const current = loadRecentProjects();
  const next = [
    entry,
    ...current.filter((currentEntry) => currentEntry.repoPath !== entry.repoPath),
  ];
  saveRecentProjects(next);
}

export function syncRecentProjectFromSession(
  repoPath: string,
  session: CurrentSession | null,
) {
  const repoName =
    session?.repoName?.trim() ||
    repoPath.split("/").filter(Boolean).at(-1) ||
    repoPath;

  upsertRecentProject({
    repoPath,
    repoName,
    lastOpenedAt: session?.lastAccessedAt ?? new Date().toISOString(),
    lastCheckedAt: session?.lastReadinessRunAt ?? null,
    latestVerdict: (session?.latestReportVerdict as Verdict | null | undefined) ?? null,
    latestReportPath: session?.latestReportPath ?? null,
    reportHistoryCount: session?.reportHistoryCount ?? 0,
  });
}

export function projectsWithReports(entries: RecentProjectEntry[]): RecentProjectEntry[] {
  return entries.filter((entry) => (entry.reportHistoryCount ?? 0) > 0);
}
