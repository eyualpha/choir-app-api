const LOCAL_FALLBACK = "http://localhost:3000";

declare global {
  interface Window {
    __HARMONIQ_API_URL?: string;
  }
}

let configuredApiUrl: string | null = null;

function normalizeUrl(url: string) {
  return url.trim().replace(/\/$/, "");
}

/** Called from root layout / providers with server-read env (runtime on Vercel). */
export function configureApiUrl(url: string) {
  configuredApiUrl = normalizeUrl(url);
  if (typeof window !== "undefined") {
    window.__HARMONIQ_API_URL = configuredApiUrl;
  }
}

export function resolveApiUrlFromEnv(...candidates: (string | undefined)[]) {
  for (const candidate of candidates) {
    if (candidate?.trim()) return normalizeUrl(candidate);
  }
  return LOCAL_FALLBACK;
}

export function getApiUrl(): string {
  if (typeof window !== "undefined" && window.__HARMONIQ_API_URL) {
    return window.__HARMONIQ_API_URL;
  }
  if (configuredApiUrl) return configuredApiUrl;
  if (process.env.NEXT_PUBLIC_API_URL?.trim()) {
    return normalizeUrl(process.env.NEXT_PUBLIC_API_URL);
  }
  return LOCAL_FALLBACK;
}
