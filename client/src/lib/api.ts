import type { ApiErrorBody } from "./types";
import { getApiUrl } from "./api-config";

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody;

  constructor(message: string, status: number, body: ApiErrorBody = {}) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type UnauthorizedListener = () => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

export function onUnauthorized(listener: UnauthorizedListener) {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

function notifyUnauthorized() {
  unauthorizedListeners.forEach((listener) => listener());
}

function isStoredTokenValid(token: string | null): token is string {
  if (!token) return false;
  const trimmed = token.trim();
  return trimmed.length > 0 && trimmed !== "null" && trimmed !== "undefined";
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("harmoniq_token");
  return isStoredTokenValid(token) ? token.trim() : null;
}

export function setToken(token: string) {
  if (!isStoredTokenValid(token)) return;
  localStorage.setItem("harmoniq_token", token.trim());
}

export function clearToken() {
  localStorage.removeItem("harmoniq_token");
  localStorage.removeItem("harmoniq_user");
}

function shouldClearSession(path: string, status: number) {
  if (status !== 401) return false;
  return !path.startsWith("/api/auth/login") && !path.includes("/api/auth/reset-password");
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit & { token?: string | null; json?: unknown; skipAuthRedirect?: boolean } = {}
): Promise<T> {
  const { token = getToken(), json, skipAuthRedirect, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);

  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${getApiUrl()}${path}`, {
    ...fetchOptions,
    headers,
    body: json !== undefined ? JSON.stringify(json) : fetchOptions.body,
  });

  const data = (await res.json().catch(() => ({}))) as T & ApiErrorBody;

  if (!res.ok) {
    if (!skipAuthRedirect && shouldClearSession(path, res.status)) {
      notifyUnauthorized();
    }
    throw new ApiError(data.message || res.statusText || "Request failed", res.status, data);
  }

  return data;
}

export async function apiForm<T = unknown>(
  path: string,
  formData: FormData,
  token?: string | null
): Promise<T> {
  const authToken = token ?? getToken();
  const headers = new Headers();
  if (authToken) headers.set("Authorization", `Bearer ${authToken}`);

  const res = await fetch(`${getApiUrl()}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = (await res.json().catch(() => ({}))) as T & ApiErrorBody;
  if (!res.ok) {
    if (shouldClearSession(path, res.status)) {
      notifyUnauthorized();
    }
    throw new ApiError(data.message || res.statusText || "Request failed", res.status, data);
  }
  return data;
}

export { getApiUrl };
