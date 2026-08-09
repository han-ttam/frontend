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
  method?: NonNullable<RequestInit["method"]>;
  body?: unknown;
  accessToken?: string;
  signal?: AbortSignal;
} & Omit<RequestInit, "body" | "headers" | "method" | "signal"> & {
    headers?: HeadersInit;
  };

export const request = async <T>(
  path: string,
  options: RequestOptions = {},
) => {
  const {
    method = "GET",
    body,
    accessToken,
    signal,
    headers: inputHeaders,
    ...init
  } = options;
  const headers = new Headers(inputHeaders);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (!headers.has("Accept-Language")) {
    headers.set("Accept-Language", "ko");
  }

  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const normalizedHeaders = Object.fromEntries(
    Array.from(headers.entries(), ([key, value]) => {
      const normalizedKey =
        key === "accept"
          ? "Accept"
          : key === "accept-language"
            ? "Accept-Language"
            : key === "content-type"
              ? "Content-Type"
              : key === "authorization"
                ? "Authorization"
                : key;

      return [normalizedKey, value];
    }),
  );

  const response = await fetch(buildApiUrl(path), {
    method,
    ...init,
    headers: normalizedHeaders,
    signal,
    body: body == null ? undefined : JSON.stringify(body),
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

export const requestJson = <T>(
  path: string,
  signal?: AbortSignal,
  options: Omit<RequestOptions, "signal"> = {},
) => {
  return request<T>(path, {
    ...options,
    signal,
  });
};
