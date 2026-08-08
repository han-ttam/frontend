import { addBookmark, fetchBookmarks, removeBookmark } from "../bookmarks";
import { ApiError } from "../client";

const jsonResponse = (status: number, body: unknown) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  };
};

describe("bookmarks API", () => {
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

  it("찜 추가는 placeId 를 담아 POST 하고 토큰으로 인증한다", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(201, { result: { bookmarked: true } }));
    global.fetch = fetchMock;

    await expect(addBookmark("place-1", "access-1")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.handdam.test/api/me/bookmarks",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ placeId: "place-1" }),
        headers: expect.objectContaining({
          Authorization: "Bearer access-1",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("찜 해제는 placeId 를 경로에 넣어 DELETE 한다", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { result: { bookmarked: false } }));
    global.fetch = fetchMock;

    await expect(removeBookmark("place-1", "access-1")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.handdam.test/api/me/bookmarks/place-1",
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({ Authorization: "Bearer access-1" }),
      }),
    );
  });

  it("2xx 인데 result 키가 없어도 성공으로 본다", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(jsonResponse(201, {}));

    await expect(addBookmark("place-1", "access-1")).resolves.toBeUndefined();
  });

  it("2xx 인데 본문이 비어 있어도 성공으로 본다", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: jest
        .fn()
        .mockRejectedValue(new SyntaxError("Unexpected end of JSON input")),
    });

    await expect(addBookmark("place-1", "access-1")).resolves.toBeUndefined();
  });

  it("서버가 실패를 주면 ApiError 를 던진다", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(
      jsonResponse(401, {
        error: { code: "UNAUTHORIZED", message: "로그인이 필요해요" },
      }),
    );

    await expect(addBookmark("place-1", "access-1")).rejects.toBeInstanceOf(
      ApiError,
    );
  });

  it("네트워크가 끊기면 그대로 던진다", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValueOnce(new TypeError("Network request failed"));

    await expect(addBookmark("place-1", "access-1")).rejects.toBeInstanceOf(
      TypeError,
    );
  });

  it("찜 목록에 토큰을 주면 Authorization 헤더가 붙는다", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(200, { result: { items: [], nextCursor: null } }),
      );
    global.fetch = fetchMock;

    await fetchBookmarks({ accessToken: "access-1", limit: 100 });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.handdam.test/api/me/bookmarks?limit=100",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer access-1" }),
      }),
    );
  });

  it("찜 목록을 토큰 없이 부르면 Authorization 헤더가 붙지 않는다", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { result: [] }));
    global.fetch = fetchMock;

    await fetchBookmarks({ limit: 50 });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers).not.toHaveProperty("Authorization");
  });
});
