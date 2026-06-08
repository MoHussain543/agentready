import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type { ReadinessReport } from "./types.js";

interface SessionFile {
  latestReportPath?: string;
  latestReportVerdict?: string;
  lastReadinessRunAt?: string;
}

export function readLatestReport(repoPath: string): ReadinessReport | null {
  const sessionPath = join(repoPath, ".agentready", "session.json");
  if (!existsSync(sessionPath)) return null;

  let session: SessionFile;
  try {
    session = JSON.parse(readFileSync(sessionPath, "utf8")) as SessionFile;
  } catch {
    return null;
  }

  if (!session.latestReportPath) return null;

  const reportPath = join(repoPath, session.latestReportPath);
  if (!existsSync(reportPath)) return null;

  try {
    return JSON.parse(readFileSync(reportPath, "utf8")) as ReadinessReport;
  } catch {
    return null;
  }
}
