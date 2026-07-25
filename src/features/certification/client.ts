import type { ApiError } from "./types";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
const TIMEOUT_MS = 10_000;

export class ApiRequestError extends Error {
  code: string;

  constructor(error: ApiError) {
    super(error.message);
    this.code = error.code;
  }
}

/** 백엔드가 아는 에러 코드는 한글 문구로 매핑한다 — 새 코드는 백엔드 message를 그대로 노출. */
const KNOWN_ERROR_MESSAGES: Record<string, string> = {
  NOT_FOUND: "요청한 데이터를 찾을 수 없습니다",
  UNAUTHORIZED: "로그인이 필요해요",
  BAD_REQUEST: "요청 값이 올바르지 않습니다",
};

async function toApiRequestError(response: Response): Promise<ApiRequestError> {
  try {
    const body = await response.json();
    const code: string | undefined = body?.error?.code;
    const message: string | undefined = body?.error?.message;
    if (code) {
      return new ApiRequestError({ code, message: KNOWN_ERROR_MESSAGES[code] ?? message ?? `서버 오류 (${response.status})` });
    }
  } catch {
    // 응답 바디가 JSON이 아니거나 비어있음 — 아래 폴백으로 처리
  }
  return new ApiRequestError({ code: "HTTP_ERROR", message: `서버 오류 (${response.status})` });
}

export async function apiGet<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw await toApiRequestError(response);
    }

    const body = await response.json();
    return (body?.result ?? body) as T;
  } catch (err) {
    if (err instanceof ApiRequestError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiRequestError({ code: "TIMEOUT", message: "요청 시간이 초과됐습니다" });
    }
    throw new ApiRequestError({ code: "NETWORK_ERROR", message: "네트워크 오류가 발생했습니다" });
  } finally {
    clearTimeout(timeout);
  }
}
