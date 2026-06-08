import { invoke } from "@tauri-apps/api/core";

export async function getAuthToken(): Promise<string | null> {
  return invoke<string | null>("get_auth_token");
}

export async function saveAuthToken(token: string): Promise<void> {
  return invoke("save_auth_token", { token });
}

export async function clearAuthToken(): Promise<void> {
  return invoke("clear_auth_token");
}

export async function openSignIn(): Promise<void> {
  return invoke("open_sign_in");
}

export interface TokenClaims {
  sub: string;
  pro: boolean;
  exp: number;
}

export function decodeTokenClaims(token: string): TokenClaims | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload)) as TokenClaims;
  } catch {
    return null;
  }
}

export function isTokenExpired(claims: TokenClaims): boolean {
  return Date.now() / 1000 > claims.exp;
}
