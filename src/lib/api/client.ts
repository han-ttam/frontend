const DEFAULT_API_BASE_URL =
  "https://further-cgi-webcast-accommodations.trycloudflare.com";

export const getApiBaseUrl = () => {
  return process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
};

const buildApiUrl = (path: string) => {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  return `${baseUrl}${path}`;
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

const readErrorBody = async (response: Response) => {
  try {
    const body = (await response.json()) as ApiErrorBody;

    return body.error;
  } catch {
    return undefined;
  }
};

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  accessToken?: string;
  signal?: AbortSignal;
};

export const request = async <T>(
  path: string,
  options: RequestOptions = {},
) => {
  const { method = "GET", body, accessToken, signal } = options;

  const response = await fetch(buildApiUrl(path), {
    method,
    headers: {
      Accept: "application/json",
      "Accept-Language": "ko",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(accessToken === undefined
        ? {}
        : { Authorization: `Bearer ${accessToken}` }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const error = await readErrorBody(response);

    throw new ApiError(
      error?.message ?? `${method} ${path} failed with HTTP ${response.status}`,
      error?.code ?? "UNKNOWN",
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as { result?: T };

  if (!("result" in payload)) {
    throw new ApiError(
      `${method} ${path} did not include a result payload`,
      "INVALID_RESPONSE",
      response.status,
    );
  }

  return payload.result as T;
};

export const requestJson = <T>(path: string, signal?: AbortSignal) => {
  return request<T>(path, { signal });
};
