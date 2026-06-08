import { invoke } from "@tauri-apps/api/core";

export function getStagedFiles(repoPath: string): Promise<string[]> {
  return invoke<string[]>("get_staged_files", { repoPath });
}

export function gitCommit(repoPath: string, message: string): Promise<string> {
  return invoke<string>("git_commit", { repoPath, message });
}
