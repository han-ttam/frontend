import { ApiError } from "../client";
import {
  loginWithOAuth,
  logoutSession,
  refreshTokens,
  withdrawAccount,
} from "../auth";

const jsonResponse = (status: number, body: unknown) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  };
};

const session = {
  user: { id: "u1", handle: "handdam", displayName: "한담" },
  tokens: { accessToken: "access-1", refreshToken: "refresh-1" },
};

describe("auth API", () => {
  const originalEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = "https://api.handdam.test";
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = originalEnv;
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("exchanges a provider access token for a handdam session", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(201, { result: session }));
    global.fetch = fetchMock;

    const result = await loginWithOAuth("kakao", "kakao-provider-token");

    expect(result).toEqual(session);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.handdam.test/api/auth/oauth/kakao",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ accessToken: "kakao-provider-token" }),
      }),
    );
  });

  it("falls back to /auth/me when the login response omits the user", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(201, { result: { tokens: session.tokens } }),
      )
      .mockResolvedValueOnce(jsonResponse(200, { result: session.user }));
    global.fetch = fetchMock;

    const result = await loginWithOAuth("google", "google-provider-token");

    expect(result).toEqual(session);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://api.handdam.test/api/auth/me",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer access-1",
        }),
      }),
    );
  });

  it("accepts tokens flattened onto the payload", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { result: session.tokens }));

    await expect(refreshTokens("refresh-1")).resolves.toEqual(session.tokens);
  });

  it("rejects a login response that carries no tokens", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(201, { result: { user: session.user } }));

    await expect(loginWithOAuth("kakao", "token")).rejects.toThrow(
      "로그인 응답에 토큰이 없어요. 잠시 후 다시 시도해 주세요.",
    );
  });

  it("surfaces the server error message when the provider token is rejected", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(
      jsonResponse(401, {
        error: { code: "UNAUTHORIZED", message: "Invalid Kakao access token" },
      }),
    );

    await expect(loginWithOAuth("kakao", "expired")).rejects.toThrow(
      new ApiError("Invalid Kakao access token", "UNAUTHORIZED", 401),
    );
  });

  it("treats a 204 logout as success without parsing a body", async () => {
    const response = jsonResponse(204, undefined);
    global.fetch = jest.fn().mockResolvedValueOnce(response);

    await expect(logoutSession("refresh-1")).resolves.toBeUndefined();
    expect(response.json).not.toHaveBeenCalled();
  });

  it("withdraws the account with a DELETE authorized by the access token", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { result: { withdrawn: true } }));
    global.fetch = fetchMock;

    await expect(withdrawAccount("access-1")).resolves.toEqual({
      withdrawn: true,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.handdam.test/api/me",
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({
          Authorization: "Bearer access-1",
        }),
      }),
    );
  });

  it("surfaces the server error when withdrawal is rejected", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(
      jsonResponse(401, {
        error: { code: "UNAUTHORIZED", message: "Access token expired" },
      }),
    );

    await expect(withdrawAccount("expired")).rejects.toThrow(
      new ApiError("Access token expired", "UNAUTHORIZED", 401),
    );
  });
});
