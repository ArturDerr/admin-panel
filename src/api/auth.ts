import type { LoginPayload, AuthResponse } from "../types";
import { getJwtPayload, isTokenValid } from "./jwt";
import { clearTokens, getAccessToken, setAccessToken } from "./tokenStore";

const API_BASE_URL =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined) ??
  "https://api.example.com";

let currentUserPhone: string | null = null;

type AuthApiResponse = {
  accessToken: string;
  expiresIn?: number;
  userPhone?: string;
};

type ApiErrorPayload = {
  message?: string;
  code?: string;
  details?: unknown;
};

function buildUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalizedBase = API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function requestJson<T>(path: string, options: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  let payload: ApiErrorPayload | T | null = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    payload = (await response.json()) as T | ApiErrorPayload;
  }

  if (!response.ok) {
    const message =
      (payload as ApiErrorPayload | null)?.message ??
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  if (!payload.phone || !payload.password) {
    throw new Error("Телефон и пароль обязательны");
  }

  const response = await requestJson<AuthApiResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response?.accessToken) {
    throw new Error("Не удалось получить access token");
  }

  setAccessToken(response.accessToken);
  currentUserPhone = response.userPhone ?? payload.phone;

  return {
    accessToken: response.accessToken,
    expiresIn: response.expiresIn,
    userPhone: currentUserPhone,
  };
}

export async function logout(): Promise<void> {
  try {
    await requestJson<{ success: boolean }>("/auth/logout", {
      method: "POST",
    });
  } finally {
    clearTokens();
    currentUserPhone = null;
  }
}

export function saveAuth(data: AuthResponse): void {
  if (data.accessToken) {
    setAccessToken(data.accessToken);
  }
  currentUserPhone = data.userPhone ?? null;
}

export function getRefreshToken(): string | null {
  return null;
}

export function getAuthPhone(): string | null {
  return currentUserPhone;
}

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  return isTokenValid(token, 10);
}

export function parseJwtPayload(token: string): Record<string, unknown> | null {
  const payload = getJwtPayload(token);
  return payload ? (payload as Record<string, unknown>) : null;
}

export { getAccessToken };
