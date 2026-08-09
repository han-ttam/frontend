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

/**
 * 액세스 토큰이 만료됐을 때 새 토큰을 받아오는 함수.
 * 구현은 AuthProvider 가 꽂는다 — 이 파일이 스토어를 알 필요가 없도록 등록만 받는다.
 * 갱신에 실패하면 undefined 를 돌려주거나 throw 하면 된다.
 */
type AuthRefreshHandler = () => Promise<string | undefined>;

let authRefreshHandler: AuthRefreshHandler | undefined;
let refreshInFlight: Promise<string | undefined> | undefined;

export const setAuthRefreshHandler = (handler?: AuthRefreshHandler) => {
  authRefreshHandler = handler;
};

/**
 * 화면 하나가 여러 요청을 동시에 보내면 401 도 동시에 온다(마이페이지는 3개).
 * 그때 갱신을 세 번 돌리면 refreshToken 이 회전하며 서로를 무효화할 수 있어,
 * 첫 요청만 갱신하고 나머지는 그 결과를 기다린다.
 */
const refreshAccessTokenOnce = async () => {
  if (!authRefreshHandler) {
    return undefined;
  }

  if (!refreshInFlight) {
    refreshInFlight = authRefreshHandler().finally(() => {
      refreshInFlight = undefined;
    });
  }

  return refreshInFlight;
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
  // 토큰을 갈아끼워 다시 보낼 수 있어야 해서 요청 조립을 함수로 묶는다.
  const send = (token: string | undefined) => {
    const headers = new Headers(inputHeaders);

    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }

    if (!headers.has("Accept-Language")) {
      headers.set("Accept-Language", "ko");
    }

    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
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

    return fetch(buildApiUrl(path), {
      method,
      ...init,
      headers: normalizedHeaders,
      signal,
      body: body == null ? undefined : JSON.stringify(body),
    });
  };

  let response = await send(accessToken);

  // 토큰을 실어 보낸 요청만 갱신 대상이다. 재시도는 한 번뿐이라 무한루프가 없다.
  if (response.status === 401 && accessToken && authRefreshHandler) {
    const nextToken = await refreshAccessTokenOnce().catch(() => undefined);

    if (nextToken) {
      response = await send(nextToken);
    }
  }

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
