import { fetchDogamRecent, fetchDogamRegions, fetchDogamThemes } from "../dogam";

const jsonResponse = (status: number, body: unknown) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  };
};

const urlOf = (call: unknown[]) => call[0] as string;
const authOf = (call: unknown[]) =>
  (call[1] as { headers: Record<string, string> }).headers.Authorization;

describe("dogam API", () => {
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

  it("시·도별 수집현황은 봉투 없이 배열로 온다", async () => {
    // 실기기 확인: recent 는 {items,nextCursor} 봉투인데 regions 는 배열 그 자체다.
    const fetchMock = jest.fn().mockResolvedValueOnce(
      jsonResponse(200, {
        result: [
          {
            sidoCode: "1",
            name: "서울",
            collected: 0,
            total: 453,
            percent: 0,
            locked: false,
            imageUrl: "http://tong.visitkorea.or.kr/x.jpg",
          },
        ],
      }),
    );
    global.fetch = fetchMock;

    const regions = await fetchDogamRegions("access-1");

    expect(regions).toHaveLength(1);
    // 서버는 sidoCode, 앱 도메인은 provinceCode 다.
    expect(regions[0]).toEqual({
      provinceCode: "1",
      name: "서울",
      collected: 0,
      total: 453,
      percent: 0,
      locked: false,
      imageUrl: "http://tong.visitkorea.or.kr/x.jpg",
    });
    expect(urlOf(fetchMock.mock.calls[0])).toBe(
      "https://api.handdam.test/api/me/dogam/regions",
    );
    expect(authOf(fetchMock.mock.calls[0])).toBe("Bearer access-1");
  });

  it("시·도 항목에 코드나 이름이 없으면 버린다", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(
      jsonResponse(200, {
        result: [
          { sidoCode: "1", name: "서울", collected: 0, total: 453 },
          { name: "코드없음" },
          null,
        ],
      }),
    );

    await expect(fetchDogamRegions("access-1")).resolves.toHaveLength(1);
  });

  it("배열이 아닌 응답이 와도 빈 목록으로 떨어진다", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { result: { items: [] } }));

    await expect(fetchDogamRegions("access-1")).resolves.toEqual([]);
  });

  it("최근 수집은 봉투에서 항목을 꺼낸다", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(
      jsonResponse(200, {
        result: {
          items: [
            {
              placeId: "p1",
              name: "여의도한강공원",
              imageUrl: null,
              collectedAt: "2026-08-09T10:00:00.000Z",
            },
          ],
          nextCursor: null,
        },
      }),
    );

    const recent = await fetchDogamRecent("access-1");

    expect(recent).toHaveLength(1);
    expect(recent[0].name).toBe("여의도한강공원");
  });

  it("최근 수집 항목에 placeId 가 없으면 버린다", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(
      jsonResponse(200, {
        result: { items: [{ name: "id 없음" }], nextCursor: null },
      }),
    );

    await expect(fetchDogamRecent("access-1")).resolves.toEqual([]);
  });

  it("테마는 봉투에서 항목을 꺼낸다", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(
      jsonResponse(200, {
        result: {
          items: [
            {
              collectionId: "c1",
              title: "한강 피크닉 명소 모음",
              filled: 7,
              total: 10,
              thumbnails: ["a.jpg"],
            },
          ],
          nextCursor: null,
        },
      }),
    );

    const themes = await fetchDogamThemes("access-1");

    expect(themes.items).toHaveLength(1);
    expect(themes.items[0].title).toBe("한강 피크닉 명소 모음");
  });
});
