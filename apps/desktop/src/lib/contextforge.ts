import { invoke } from "@tauri-apps/api/core";

export interface StackInfo {
  detected: boolean;
  languages: string[];
  frameworks: string[];
  buildTools: string[];
  databases: string[];
  testFrameworks: string[];
  hasDocker: boolean;
  hasMigrations: boolean;
  summary: string;
}

export interface ContextForgeStatus {
  hasCursorrules: boolean;
  hasAgentsMd: boolean;
  stack: StackInfo;
  canGenerate: boolean;
}

export function checkContextForgeStatus(repoPath: string): Promise<ContextForgeStatus> {
  return invoke<ContextForgeStatus>("check_context_forge_status", { repoPath });
}

export function generateContextFiles(repoPath: string, userToken: string): Promise<ContextForgeStatus> {
  return invoke<ContextForgeStatus>("generate_context_files", { repoPath, userToken });
}
