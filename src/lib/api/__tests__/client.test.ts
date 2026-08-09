import { ApiError, request, setAuthRefreshHandler } from "../client";

const jsonResponse = (status: number, body: unknown) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  };
};

const unauthorized = () =>
  jsonResponse(401, {
    error: { code: "UNAUTHORIZED", message: "Invalid or expired token" },
  });

const authorizationOf = (call: unknown[]) =>
  (call[1] as { headers: Record<string, string> }).headers.Authorization;

describe("request 토큰 갱신", () => {
  const originalEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = "https://api.handdam.test";
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = originalEnv;
    global.fetch = originalFetch;
    setAuthRefreshHandler(undefined);
    jest.restoreAllMocks();
  });

  it("401 이면 토큰을 갱신하고 새 토큰으로 한 번 재시도한다", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(jsonResponse(200, { result: { ok: true } }));
    global.fetch = fetchMock;
    setAuthRefreshHandler(jest.fn().mockResolvedValue("access-2"));

    await expect(
      request("/api/me/profile", { accessToken: "access-1" }),
    ).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(authorizationOf(fetchMock.mock.calls[0])).toBe("Bearer access-1");
    expect(authorizationOf(fetchMock.mock.calls[1])).toBe("Bearer access-2");
  });

  it("갱신 핸들러가 없으면 401 을 그대로 던진다", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce(unauthorized());
    global.fetch = fetchMock;

    await expect(
      request("/api/me/profile", { accessToken: "access-1" }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("재시도도 401 이면 더 갱신하지 않고 던진다", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(unauthorized());
    global.fetch = fetchMock;
    const refresh = jest.fn().mockResolvedValue("access-2");
    setAuthRefreshHandler(refresh);

    await expect(
      request("/api/me/profile", { accessToken: "access-1" }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("갱신이 실패하면 원래 401 을 던진다", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce(unauthorized());
    global.fetch = fetchMock;
    setAuthRefreshHandler(jest.fn().mockRejectedValue(new Error("refresh 실패")));

    await expect(
      request("/api/me/profile", { accessToken: "access-1" }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("동시에 401 을 받아도 갱신은 한 번만 돈다", async () => {
    // 마이페이지는 프로필·모음·랭킹 3개가 동시에 나간다.
    global.fetch = jest.fn().mockImplementation((_url, init) => {
      const auth = (init as { headers: Record<string, string> }).headers
        .Authorization;

      return Promise.resolve(
        auth === "Bearer access-2"
          ? jsonResponse(200, { result: { ok: true } })
          : unauthorized(),
      );
    });

    const refresh = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("access-2"), 10);
        }),
    );
    setAuthRefreshHandler(refresh);

    await expect(
      Promise.all([
        request("/api/me/profile", { accessToken: "access-1" }),
        request("/api/me/collections", { accessToken: "access-1" }),
        request("/api/rankings", { accessToken: "access-1" }),
      ]),
    ).resolves.toHaveLength(3);

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("토큰 없이 보낸 요청은 갱신하지 않는다", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce(unauthorized());
    global.fetch = fetchMock;
    const refresh = jest.fn();
    setAuthRefreshHandler(refresh);

    await expect(request("/api/me/profile")).rejects.toBeInstanceOf(ApiError);

    expect(refresh).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("401 이 아닌 실패는 갱신하지 않는다", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(500, {
          error: { code: "INTERNAL", message: "Internal server error" },
        }),
      );
    global.fetch = fetchMock;
    const refresh = jest.fn();
    setAuthRefreshHandler(refresh);

    await expect(
      request("/api/me/collections", { accessToken: "access-1" }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(refresh).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
