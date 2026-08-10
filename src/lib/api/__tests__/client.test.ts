import { ApiError, request, setAuthRefreshHandler } from "../client";

/**
 * certification 이 자체 client 를 버리고 이 공용 client 로 옮겨오면서, 삭제된
 * features/certification/client.test.ts 가 덮던 에러 분기들이 무주공산이 됐다.
 * 이 client 는 이제 앱 전체의 단일 HTTP 경로라 그 분기들이 깨지면 전 기능이 영향을 받는다.
 */
const originalFetch = globalThis.fetch;
const originalEnv = process.env.EXPO_PUBLIC_API_BASE_URL;

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env.EXPO_PUBLIC_API_BASE_URL = originalEnv;
  setAuthRefreshHandler(undefined);
});

function mockFetchOnce(response: { ok?: boolean; status?: number; json?: () => Promise<unknown> }) {
  const { ok = true, status = 200, json = async () => ({}) } = response;
  const fetchMock = jest.fn().mockResolvedValue({ ok, status, json } as Response);
  globalThis.fetch = fetchMock;
  return fetchMock;
}

describe("request 에러 분기", () => {
  it("에러 바디가 JSON 이 아니면 UNKNOWN 코드와 상태코드를 남긴다", async () => {
    mockFetchOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new SyntaxError("Unexpected end of JSON input");
      },
    });

    const error = await request("/api/x").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: "UNKNOWN", status: 500 });
  });

  it("백엔드가 준 code 와 message 를 그대로 보존한다", async () => {
    mockFetchOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: { code: "NOT_FOUND", message: "Place not found" } }),
    });

    await expect(request("/api/places/missing")).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Place not found",
      status: 404,
    });
  });

  it("200 인데 result 봉투가 없으면 INVALID_RESPONSE 로 막는다", async () => {
    mockFetchOnce({ json: async () => ({ items: [] }) });

    await expect(request("/api/x")).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
      status: 200,
    });
  });

  it("204 는 바디를 읽지 않고 undefined 를 돌려준다", async () => {
    mockFetchOnce({ status: 204, json: async () => {
      throw new Error("204 에서는 바디를 읽으면 안 된다");
    } });

    await expect(request("/api/me/bookmarks/p1", { method: "DELETE" })).resolves.toBeUndefined();
  });
});

describe("URL 조립", () => {
  it("base URL 이 /api 로 끝나고 path 도 /api 로 시작하면 중복을 잘라낸다", async () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = "https://api.handdam.store/api";
    const fetchMock = mockFetchOnce({ json: async () => ({ result: [] }) });

    await request("/api/places/nearby?lat=37.88");

    expect(fetchMock.mock.calls[0][0]).toBe("https://api.handdam.store/api/places/nearby?lat=37.88");
  });

  it("base URL 에 /api 가 없으면 path 를 그대로 붙인다", async () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = "http://localhost:3000";
    const fetchMock = mockFetchOnce({ json: async () => ({ result: [] }) });

    await request("/api/places/nearby");

    expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:3000/api/places/nearby");
  });

  it("accessToken 을 주면 Authorization 헤더를 붙인다", async () => {
    const fetchMock = mockFetchOnce({ json: async () => ({ result: {} }) });

    await request("/api/me/profile", { accessToken: "tok" });

    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer tok");
  });
});

/**
 * 토큰 만료 시 자동 갱신.
 * refreshTokens() 가 구현만 돼 있고 호출부가 0곳이라, 토큰이 만료되면
 * /me/* 계열이 전부 죽고 재로그인 외엔 복구가 안 됐다.
 */
const unauthorized = () => ({
  ok: false,
  status: 401,
  json: async () => ({
    error: { code: "UNAUTHORIZED", message: "Invalid or expired token" },
  }),
});

const okResult = () => ({
  ok: true,
  status: 200,
  json: async () => ({ result: { ok: true } }),
});

const authorizationOf = (call: unknown[]) =>
  (call[1] as { headers: Record<string, string> }).headers.Authorization;

describe("토큰 갱신", () => {
  it("401 이면 토큰을 갱신하고 새 토큰으로 한 번 재시도한다", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(okResult());
    globalThis.fetch = fetchMock;
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
    globalThis.fetch = fetchMock;

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
    globalThis.fetch = fetchMock;
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
    globalThis.fetch = fetchMock;
    setAuthRefreshHandler(
      jest.fn().mockRejectedValue(new Error("refresh 만료")),
    );

    await expect(
      request("/api/me/profile", { accessToken: "access-1" }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("동시에 401 을 받아도 갱신은 한 번만 돈다", async () => {
    // 마이페이지는 프로필·수집현황·랭킹·모음 4개가 동시에 나간다.
    // 갱신을 각자 돌리면 refreshToken 이 회전하며 서로를 무효화할 수 있다.
    globalThis.fetch = jest.fn().mockImplementation((_url, init) => {
      const auth = (init as { headers: Record<string, string> }).headers
        .Authorization;

      return Promise.resolve(auth === "Bearer access-2" ? okResult() : unauthorized());
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
    globalThis.fetch = fetchMock;
    const refresh = jest.fn();
    setAuthRefreshHandler(refresh);

    await expect(request("/api/me/profile")).rejects.toBeInstanceOf(ApiError);

    expect(refresh).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("401 이 아닌 실패는 갱신하지 않는다", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        error: { code: "INTERNAL", message: "Internal server error" },
      }),
    });
    globalThis.fetch = fetchMock;
    const refresh = jest.fn();
    setAuthRefreshHandler(refresh);

    await expect(
      request("/api/me/collections", { accessToken: "access-1" }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(refresh).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
