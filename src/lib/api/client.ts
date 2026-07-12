const DEFAULT_API_BASE_URL =
  "https://further-cgi-webcast-accommodations.trycloudflare.com";

export const getApiBaseUrl = () => {
  return process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
};

const buildApiUrl = (path: string) => {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  return `${baseUrl}${path}`;
};

export const requestJson = async <T>(
  path: string,
  signal?: AbortSignal,
) => {
  const response = await fetch(buildApiUrl(path), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Accept-Language": "ko",
    },
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
