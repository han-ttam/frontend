import { ApiError } from "@/lib/api/client";

import { getNearbyPlaces, getPlace } from "./api";

// globalThis.fetch 를 직접 갈아끼우면 restoreAllMocks 로는 안 돌아온다 — 원본을 붙잡아 뒀다 되돌린다.
const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  jest.restoreAllMocks();
});

function mockFetchOnce(response: { ok?: boolean; status?: number; jsonBody?: unknown }) {
  const { ok = true, status = 200, jsonBody } = response;
  const fetchMock = jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => jsonBody,
  } as Response);
  globalThis.fetch = fetchMock;
  return fetchMock;
}

const NEARBY_ITEM = {
  placeId: "019f383f-1570-713b-9b82-95c6a06554f3",
  name: "춘천 명동 닭갈비 골목",
  address: "강원특별자치도 춘천시 조양동 52",
  distanceM: 139,
  regionCode: "32_13",
  thumbnailUrl: "http://example.com/a.jpg",
};

describe("getNearbyPlaces", () => {
  it("서버 응답 필드를 NearbyPlace 로 매핑한다", async () => {
    mockFetchOnce({ jsonBody: { result: [NEARBY_ITEM] } });

    const places = await getNearbyPlaces({ lat: 37.88, lng: 127.73, radius: 2000, limit: 20 });

    expect(places).toEqual([
      {
        id: NEARBY_ITEM.placeId,
        name: NEARBY_ITEM.name,
        rarityWeight: 1,
        distanceMeters: 139,
      },
    ]);
  });

  it("base URL 이 /api 로 끝나도 경로가 중복되지 않는다", async () => {
    const fetchMock = mockFetchOnce({ jsonBody: { result: [] } });

    await getNearbyPlaces({ lat: 37.88, lng: 127.73, radius: 2000, limit: 20 });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).not.toContain("/api/api/");
    expect(url).toContain("/places/nearby?lat=37.88&lng=127.73&radius=2000&limit=20");
  });

  it("서버가 준 정렬 순서를 그대로 유지한다", async () => {
    mockFetchOnce({
      jsonBody: {
        result: [
          { ...NEARBY_ITEM, placeId: "a", distanceM: 139 },
          { ...NEARBY_ITEM, placeId: "b", distanceM: 402 },
          { ...NEARBY_ITEM, placeId: "c", distanceM: 447 },
        ],
      },
    });

    const places = await getNearbyPlaces({ lat: 37.88, lng: 127.73, radius: 2000, limit: 20 });

    expect(places.map((p) => p.id)).toEqual(["a", "b", "c"]);
  });
});

describe("에러 정규화", () => {
  it("HTTP 에러는 code 와 status 를 보존한 ApiError 가 된다", async () => {
    mockFetchOnce({
      ok: false,
      status: 404,
      jsonBody: { error: { code: "NOT_FOUND", message: "Place not found" } },
    });

    await expect(getPlace("missing")).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    });
  });

  it("네트워크 실패도 ApiError 로 감싼다", async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new TypeError("Network request failed"));

    const error = await getPlace("p1").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: "NETWORK_ERROR", status: 0 });
  });

  it("요청이 중단되면 TIMEOUT 으로 바꾼다", async () => {
    const abortError = new Error("Aborted");
    abortError.name = "AbortError";
    globalThis.fetch = jest.fn().mockRejectedValue(abortError);

    await expect(getPlace("p1")).rejects.toMatchObject({ code: "TIMEOUT", status: 0 });
  });
});
