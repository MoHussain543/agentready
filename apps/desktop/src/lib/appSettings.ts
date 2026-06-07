import { invoke } from "@tauri-apps/api/core";

export interface AppSettings {
  javaBinaryOverride?: string | null;
  appVersion: string;
}

export async function loadAppSettings(): Promise<AppSettings> {
  try {
    return await invoke<AppSettings>("load_app_settings");
  } catch (error) {
    throw new Error(formatError(error, "Failed to load desktop settings."));
  }
}

export async function saveAppSettings(
  javaBinaryOverride: string | null,
): Promise<AppSettings> {
  try {
    return await invoke<AppSettings>("save_app_settings", {
      javaBinaryOverride:
        javaBinaryOverride && javaBinaryOverride.trim().length > 0
          ? javaBinaryOverride.trim()
          : null,
    });
  } catch (error) {
    throw new Error(formatError(error, "Failed to save desktop settings."));
  }
}

function formatError(error: unknown, fallback: string): string {
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
