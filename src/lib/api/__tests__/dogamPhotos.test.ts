import {
  clearPlaceRepresentativePhoto,
  fetchPlacePhotos,
  fetchRegionPhotos,
  setPlaceRepresentativePhoto,
  setRegionRepresentativePhoto,
} from "../dogamPhotos";

const jsonResponse = (status: number, body: unknown) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  };
};

const urlOf = (call: unknown[]) => call[0] as string;
const initOf = (call: unknown[]) =>
  call[1] as { method: string; body?: string; headers: Record<string, string> };

describe("dogam 사진첩 API", () => {
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

  it("지역 사진첩을 조회한다", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce(
      jsonResponse(200, {
        result: [
          {
            photoId: "ph1",
            placeId: "p1",
            placeName: "여의도한강공원",
            imageUrl: "https://x/1.jpg",
            verifiedAt: "2026-08-09T10:00:00.000Z",
          },
        ],
      }),
    );
    global.fetch = fetchMock;

    const photos = await fetchRegionPhotos("1", "access-1");

    expect(photos).toHaveLength(1);
    expect(photos[0].placeName).toBe("여의도한강공원");
    expect(urlOf(fetchMock.mock.calls[0])).toBe(
      "https://api.handdam.test/api/me/regions/1/photos",
    );
  });

  it("봉투로 와도 항목을 꺼낸다", async () => {
    // regions 는 배열, recent 는 봉투였다. 사진첩은 어느 쪽인지 확인하지 못했다.
    global.fetch = jest.fn().mockResolvedValueOnce(
      jsonResponse(200, {
        result: {
          items: [{ photoId: "ph1", imageUrl: "https://x/1.jpg" }],
          nextCursor: null,
        },
      }),
    );

    await expect(fetchPlacePhotos("p1", "access-1")).resolves.toHaveLength(1);
  });

  it("사진 식별자나 이미지가 없는 항목은 버린다", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(
      jsonResponse(200, {
        result: [
          { photoId: "ph1", imageUrl: "https://x/1.jpg" },
          { photoId: "ph2" },
          { imageUrl: "https://x/3.jpg" },
          null,
        ],
      }),
    );

    await expect(fetchRegionPhotos("1", "access-1")).resolves.toHaveLength(1);
  });

  it("관광지 대표사진을 지정한다", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { result: { ok: true } }));
    global.fetch = fetchMock;

    await expect(
      setPlaceRepresentativePhoto("p1", "ph1", "access-1"),
    ).resolves.toBeUndefined();

    const init = initOf(fetchMock.mock.calls[0]);
    expect(urlOf(fetchMock.mock.calls[0])).toBe(
      "https://api.handdam.test/api/me/places/p1/representative",
    );
    expect(init.method).toBe("PUT");
    expect(init.body).toBe(JSON.stringify({ photoId: "ph1" }));
    expect(init.headers.Authorization).toBe("Bearer access-1");
  });

  it("시·도 대표사진을 지정한다", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { result: { ok: true } }));
    global.fetch = fetchMock;

    await setRegionRepresentativePhoto("32", "ph9", "access-1");

    expect(urlOf(fetchMock.mock.calls[0])).toBe(
      "https://api.handdam.test/api/me/regions/32/representative",
    );
    expect(initOf(fetchMock.mock.calls[0]).method).toBe("PUT");
  });

  it("대표사진을 해제한다", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: jest.fn(),
    });
    global.fetch = fetchMock;

    await expect(
      clearPlaceRepresentativePhoto("p1", "access-1"),
    ).resolves.toBeUndefined();
    expect(initOf(fetchMock.mock.calls[0]).method).toBe("DELETE");
  });

  it("2xx 인데 본문 형태가 달라도 성공으로 본다", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(jsonResponse(200, {}));

    await expect(
      setPlaceRepresentativePhoto("p1", "ph1", "access-1"),
    ).resolves.toBeUndefined();
  });

  it("서버가 실패를 주면 던진다", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(
      jsonResponse(404, {
        error: { code: "NOT_FOUND", message: "Photo not found" },
      }),
    );

    await expect(
      setPlaceRepresentativePhoto("p1", "ph1", "access-1"),
    ).rejects.toThrow("Photo not found");
  });
});
