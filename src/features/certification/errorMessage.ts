import { ApiError } from "@/lib/api/client";

/**
 * 에러 코드를 사용자에게 보여줄 한글 문구로 바꾼다 — 식별(ApiError.code/status)과 표현을 분리하기
 * 위해 클래스가 아니라 함수로 둔다. 모르는 코드는 백엔드가 준 message 를 그대로 노출한다.
 */
const KNOWN_ERROR_MESSAGES: Record<string, string> = {
  NOT_FOUND: "요청한 데이터를 찾을 수 없습니다",
  UNAUTHORIZED: "로그인이 필요해요",
  BAD_REQUEST: "요청 값이 올바르지 않습니다",
  TIMEOUT: "요청 시간이 초과됐습니다",
  NETWORK_ERROR: "네트워크 오류가 발생했습니다",
};

export function toErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) return fallback;

  const known = KNOWN_ERROR_MESSAGES[error.code];
  if (known) return known;

  // 백엔드가 code 를 안 준 경우(UNKNOWN) message 는 "GET /api/... failed with HTTP 500" 같은
  // 개발자용 문구라 사용자에게 그대로 보여주지 않는다.
  if (error.code === "UNKNOWN") return `서버 오류 (${error.status})`;

  return error.message || fallback;
}
