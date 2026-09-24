const FALLBACK_API = "http://localhost:8787";
const STORAGE_KEY = "transcribe-live.api";

export function apiBaseUrl(): string {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_URL ?? FALLBACK_API;
  }

  const fromQuery = new URLSearchParams(window.location.search).get("api");
  if (fromQuery) {
    window.localStorage.setItem(STORAGE_KEY, fromQuery);
    return stripTrailingSlash(fromQuery);
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stripTrailingSlash(stored ?? process.env.NEXT_PUBLIC_API_URL ?? FALLBACK_API);
}

export function wsBaseUrl(): string {
  return apiBaseUrl().replace(/^http/, "ws");
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}
