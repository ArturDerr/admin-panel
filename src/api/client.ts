import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from "./tokenStore";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiClientOptions = {
  baseUrl?: string;
  credentials?: RequestCredentials;
  onUnauthorized?: () => void;
};

type RequestOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
  skipAuth?: boolean;
};

type ApiErrorPayload = {
  message?: string;
  code?: string;
  details?: unknown;
};

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const DEFAULT_BASE_URL =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined) ??
  "https://f-rent-develop.ru/api/v1";

const defaultOptions: Required<ApiClientOptions> = {
  baseUrl: DEFAULT_BASE_URL,
  credentials: "include",
  onUnauthorized: () => undefined,
};

let refreshPromise: Promise<string | null> | null = null;

function buildUrl(baseUrl: string, path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function parseJsonSafe(response: Response): Promise<unknown | null> {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return null;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const payload = (await parseJsonSafe(response)) as ApiErrorPayload | null;

  if (!response.ok) {
    const message =
      payload?.message || `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, payload ?? undefined);
  }

  return payload as T;
}

async function refreshAccessToken(
  options: Required<ApiClientOptions>,
): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshUrl = buildUrl(options.baseUrl, "/auth/refresh");
      const storedRefreshToken = getRefreshToken();
      const response = await fetch(refreshUrl, {
        method: "POST",
        credentials: options.credentials,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: storedRefreshToken ?? "" }),
      });

      if (!response.ok) {
        clearTokens();
        options.onUnauthorized();
        return null;
      }

      const payload = (await parseJsonSafe(response)) as {
        accessToken?: string;
      } | null;

      const accessToken = payload?.accessToken ?? null;
      if (accessToken) {
        setAccessToken(accessToken);
      }

      return accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function request<T>(
  path: string,
  requestOptions: RequestOptions,
  clientOptions?: ApiClientOptions,
): Promise<T> {
  const options = { ...defaultOptions, ...clientOptions };
  const url = buildUrl(options.baseUrl, path);

  const headers: Record<string, string> = {
    ...requestOptions.headers,
  };

  if (
    !requestOptions.headers?.["Content-Type"] &&
    !(requestOptions.body instanceof FormData)
  ) {
    headers["Content-Type"] = "application/json";
  }

  const accessToken = getAccessToken();
  if (accessToken && !requestOptions.skipAuth) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    method: requestOptions.method ?? "GET",
    credentials: options.credentials,
    headers,
    body:
      requestOptions.body !== undefined
        ? requestOptions.body instanceof FormData
          ? requestOptions.body
          : JSON.stringify(requestOptions.body)
        : undefined,
    signal: requestOptions.signal,
  });

  if (response.status !== 401 || requestOptions.skipAuth) {
    return handleResponse<T>(response);
  }

  const refreshedToken = await refreshAccessToken(options);
  if (!refreshedToken) {
    throw new ApiError(401, "Unauthorized");
  }

  const retryHeaders: Record<string, string> = {
    ...headers,
    Authorization: `Bearer ${refreshedToken}`,
  };

  const retryResponse = await fetch(url, {
    method: requestOptions.method ?? "GET",
    credentials: options.credentials,
    headers: retryHeaders,
    body:
      requestOptions.body !== undefined
        ? requestOptions.body instanceof FormData
          ? requestOptions.body
          : JSON.stringify(requestOptions.body)
        : undefined,
    signal: requestOptions.signal,
  });

  return handleResponse<T>(retryResponse);
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions, client?: ApiClientOptions) {
    return request<T>(path, { ...options, method: "GET" }, client);
  },
  post<T>(path: string, body?: unknown, client?: ApiClientOptions) {
    return request<T>(path, { method: "POST", body }, client);
  },
  put<T>(path: string, body?: unknown, client?: ApiClientOptions) {
    return request<T>(path, { method: "PUT", body }, client);
  },
  patch<T>(path: string, body?: unknown, client?: ApiClientOptions) {
    return request<T>(path, { method: "PATCH", body }, client);
  },
  delete<T>(path: string, body?: unknown, client?: ApiClientOptions) {
    return request<T>(path, { method: "DELETE", body }, client);
  },
};
