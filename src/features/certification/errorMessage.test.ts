import { ApiError } from "@/lib/api/client";

import { toErrorMessage } from "./errorMessage";

describe("toErrorMessage", () => {
  it("아는 코드는 한글 문구로 바꾼다", () => {
    const error = new ApiError("Place not found", "NOT_FOUND", 404);

    expect(toErrorMessage(error, "폴백")).toBe("요청한 데이터를 찾을 수 없습니다");
  });

  it("모르는 코드는 백엔드 message 를 그대로 보여준다", () => {
    const error = new ApiError("I'm a teapot", "TEAPOT", 418);

    expect(toErrorMessage(error, "폴백")).toBe("I'm a teapot");
  });

  it("code 가 없는(UNKNOWN) 응답은 상태코드를 붙인 문구로 바꾼다", () => {
    // 공용 클라이언트는 error.code 가 없으면 UNKNOWN 을 넣고 message 에 개발자용 문구를 담는다.
    const error = new ApiError("GET /api/x failed with HTTP 500", "UNKNOWN", 500);

    expect(toErrorMessage(error, "폴백")).toBe("서버 오류 (500)");
  });

  it("ApiError 가 아니면 폴백을 쓴다", () => {
    expect(toErrorMessage(new Error("boom"), "폴백")).toBe("폴백");
    expect(toErrorMessage(undefined, "폴백")).toBe("폴백");
    expect(toErrorMessage(null, "폴백")).toBe("폴백");
  });
});
