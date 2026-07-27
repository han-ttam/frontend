import { apiGet, ApiRequestError } from "./client";

function mockFetchOnce(response: Partial<Response> & { jsonBody?: unknown }) {
  const { jsonBody, ...rest } = response;
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => jsonBody,
    ...rest,
  } as Response);
}

describe("apiGet", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("unwraps the {result: ...} envelope", async () => {
    mockFetchOnce({ jsonBody: { result: { id: "p1" } } });
    const data = await apiGet<{ id: string }>("/api/places/p1");
    expect(data).toEqual({ id: "p1" });
  });

  it("maps a known backend error code (NOT_FOUND) to a Korean message", async () => {
    mockFetchOnce({ ok: false, status: 404, jsonBody: { error: { code: "NOT_FOUND", message: "Place not found" } } });
    await expect(apiGet("/api/places/missing")).rejects.toMatchObject(
      new ApiRequestError({ code: "NOT_FOUND", message: "요청한 데이터를 찾을 수 없습니다" }),
    );
  });

  it("falls back to the backend's raw message for an unmapped error code", async () => {
    mockFetchOnce({
      ok: false,
      status: 418,
      jsonBody: { error: { code: "TEAPOT", message: "I'm a teapot" } },
    });
    await expect(apiGet("/api/x")).rejects.toMatchObject(
      new ApiRequestError({ code: "TEAPOT", message: "I'm a teapot" }),
    );
  });

  it("falls back to a generic message when the error body isn't parseable JSON", async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new SyntaxError("Unexpected end of JSON input");
      },
    } as unknown as Response);

    await expect(apiGet("/api/x")).rejects.toMatchObject(
      new ApiRequestError({ code: "HTTP_ERROR", message: "서버 오류 (500)" }),
    );
  });
});
