import type { JwtPayload } from "../types";

type JwtHeader = {
  alg: string;
  typ: string;
};

type JwtLikePayload = Partial<JwtPayload> & Record<string, unknown>;

function base64UrlToBase64(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  return pad === 0 ? normalized : normalized + "=".repeat(4 - pad);
}

function decodeBase64(base64: string): string {
  return atob(base64);
}

function decodePart<T = unknown>(part: string): T {
  const json = decodeBase64(base64UrlToBase64(part));
  return JSON.parse(json) as T;
}

export function parseJwt(
  token: string,
): { header: JwtHeader; payload: JwtLikePayload; signature: string } | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const header = decodePart<JwtHeader>(parts[0]);
    const payload = decodePart<JwtLikePayload>(parts[1]);
    const signature = parts[2];
    return { header, payload, signature };
  } catch {
    return null;
  }
}

export function getJwtPayload(token: string): JwtLikePayload | null {
  return parseJwt(token)?.payload ?? null;
}

export function isTokenExpired(token: string, clockSkewSeconds = 0): boolean {
  const payload = getJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;

  const now = Math.floor(Date.now() / 1000);
  return now >= payload.exp - clockSkewSeconds;
}

export function isTokenValid(token: string, clockSkewSeconds = 0): boolean {
  return parseJwt(token) !== null && !isTokenExpired(token, clockSkewSeconds);
}

export function getTokenRemainingSeconds(token: string): number {
  const payload = getJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return 0;

  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - now);
}
