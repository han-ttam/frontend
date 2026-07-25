const DEFAULT_API_BASE_URL = "https://api.handdam.store/api";

export const getApiBaseUrl = () => {
  return process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
};

const buildApiUrl = (path: string) => {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const normalizedPath =
    baseUrl.endsWith("/api") && path.startsWith("/api/")
      ? path.slice(4)
      : path;

  return `${baseUrl}${normalizedPath}`;
};

export const requestJson = async <T>(
  path: string,
  signal?: AbortSignal,
  init?: RequestInit,
) => {
  const headers = new Headers(init?.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (!headers.has("Accept-Language")) {
    headers.set("Accept-Language", "ko");
  }

  const response = await fetch(buildApiUrl(path), {
    method: "GET",
    ...init,
    headers,
    signal,
  });

  if (!response.ok) {
    throw new Error(`GET ${path} failed with HTTP ${response.status}`);
  }

  const body = (await response.json()) as { result?: T };

  if (!("result" in body)) {
    throw new Error(`GET ${path} did not include a result payload`);
  }

  return body.result as T;
};
