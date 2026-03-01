import type { LoginPayload, AuthResponse } from "../types";
import { getJwtPayload, isTokenValid } from "./jwt";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken as getRefreshTokenFromStore,
  setTokens,
  LS_PHONE_KEY,
} from "./tokenStore";
import { createLogger } from "../utils/logger";

const logger = createLogger("Auth");

const API_BASE_URL =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined) ??
  "https://f-rent-develop.ru/api/v1";

const API_KEY = "IceOne";

let currentUserPhone: string | null = (() => {
  try {
    return localStorage.getItem(LS_PHONE_KEY);
  } catch {
    return null;
  }
})();

type AuthApiResponse = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  userPhone?: string;
};

type ApiErrorPayload = {
  message?: string;
  detail?: string;
  code?: string;
};

function buildUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalizedBase = API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function requestJson<T>(path: string, options: RequestInit): Promise<T> {
  const url = buildUrl(path);
  logger.debug(`${options.method ?? "GET"} ${url}`);

  const headers = {
    "Content-Type": "application/json",
    "X-API-KEY": API_KEY,
    ...options.headers,
  };

  console.log("Sending headers:", headers);
  console.log("Sending body:", options.body);

  const response = await fetch(url, {
    credentials: "include",
    headers,
    method: options.method,
    body: options.body,
  });

  let payload: ApiErrorPayload | T | null = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    payload = (await response.json()) as T | ApiErrorPayload;
  }

  if (!response.ok) {
    const errPayload = payload as ApiErrorPayload | null;
    const message =
      errPayload?.message ??
      errPayload?.detail ??
      `Request failed with status ${response.status}`;
    logger.error(
      `${options.method ?? "GET"} ${path} → ${response.status}: ${message}`,
    );
    throw new Error(message);
  }

  logger.debug(`${options.method ?? "GET"} ${path} → ${response.status} OK`);
  return payload as T;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  if (!payload.phone || !payload.password) {
    throw new Error("Телефон и пароль обязательны");
  }

  logger.info(`Login attempt: phone=${payload.phone.slice(0, 4)}***`);

  const response = await requestJson<AuthApiResponse>("/auth/login_admin", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response?.accessToken) {
    logger.error("Login failed: no accessToken in response");
    throw new Error("Не удалось получить access token");
  }

  setTokens(response.accessToken, response.refreshToken ?? null);

  currentUserPhone = response.userPhone ?? payload.phone;
  try {
    localStorage.setItem(LS_PHONE_KEY, currentUserPhone);
  } catch {}

  logger.info(`Login success: userPhone=${currentUserPhone}`);

  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresIn: response.expiresIn,
    userPhone: currentUserPhone,
  };
}

export async function logout(): Promise<void> {
  logger.info("Logout");
  try {
    await requestJson<{ ok: boolean }>("/auth/logout", {
      method: "POST",
    });
  } catch (e) {
    logger.warn("Logout request failed (continuing with local cleanup)", e);
  } finally {
    clearTokens();
    currentUserPhone = null;
  }
}

export function saveAuth(data: AuthResponse): void {
  if (data.accessToken) {
    setTokens(data.accessToken, data.refreshToken ?? undefined);
  }
  if (data.userPhone) {
    currentUserPhone = data.userPhone;
    try {
      localStorage.setItem(LS_PHONE_KEY, currentUserPhone);
    } catch {}
  }
}

export function getRefreshToken(): string | null {
  return getRefreshTokenFromStore();
}

export function getAuthPhone(): string | null {
  return currentUserPhone;
}

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) {
    logger.debug("isAuthenticated: no token");
    return false;
  }
  const valid = isTokenValid(token, 10);
  logger.debug(`isAuthenticated: ${valid}`);
  return valid;
}

export function parseJwtPayload(token: string): Record<string, unknown> | null {
  const payload = getJwtPayload(token);
  return payload ? (payload as Record<string, unknown>) : null;
}

type AdminCreatePayload = {
  phone: string;
  fullname: string;
  password: string;
  role?: "admin";
};

export async function createAdmin(payload: AdminCreatePayload): Promise<void> {
  await requestJson<{ ok?: boolean }>("/admin/auth/create", {
    method: "POST",
    body: JSON.stringify({ ...payload, role: "admin" }),
  });
}

export { getAccessToken };
