import { invoke } from "@tauri-apps/api/core";

export function gitCommit(repoPath: string, message: string): Promise<string> {
  return invoke<string>("git_commit", { repoPath, message });
}
