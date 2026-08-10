import {
  fetchDogamOverview,
  fetchMyCollections,
  fetchMyProfile,
  fetchRankings,
} from "../mypage";

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

describe("mypage API", () => {
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

  it("프로필을 토큰으로 조회한다", async () => {
    // 실기기에서 확인한 실제 응답이다.
    const profile = {
      handle: "user_7ec12d47",
      displayName: "최서윤",
      avatarUrl: null,
      level: 1,
      exp: 0,
      expForNextLevel: 100,
      dogamPercent: 0,
      visitedCount: 0,
      nationalRank: null,
      totalUsers: 0,
    };
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { result: profile }));
    global.fetch = fetchMock;

    await expect(fetchMyProfile("access-1")).resolves.toEqual(profile);
    expect(urlOf(fetchMock.mock.calls[0])).toBe(
      "https://api.handdam.test/api/me/profile",
    );
    expect(authOf(fetchMock.mock.calls[0])).toBe("Bearer access-1");
  });

  it("전국 수집현황을 조회한다", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(
      jsonResponse(200, {
        result: { percent: 0, collected: 0, total: 7658 },
      }),
    );

    await expect(fetchDogamOverview("access-1")).resolves.toEqual({
      percent: 0,
      collected: 0,
      total: 7658,
    });
  });

  it("랭킹은 기간을 쿼리로 넘긴다", async () => {
    const rankings = {
      topPercent: null,
      top3: [],
      leaderboard: { items: [], nextCursor: null },
      me: { rank: null, score: 0, dogamPercent: 0, pointsToNext: 0 },
    };
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { result: rankings }));
    global.fetch = fetchMock;

    await expect(fetchRankings("MONTHLY", "access-1")).resolves.toEqual(
      rankings,
    );
    expect(urlOf(fetchMock.mock.calls[0])).toContain("period=MONTHLY");
  });

  it("모음 목록을 조회한다", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(200, { result: { items: [], nextCursor: null } }),
      );

    await expect(fetchMyCollections("access-1")).resolves.toEqual({
      items: [],
      nextCursor: null,
    });
  });

  it("모음 목록이 500 이어도 예외를 그대로 올린다", async () => {
    // 2026-08-09 현재 서버가 실제로 500 을 준다. 훅이 빈 상태로 처리한다.
    global.fetch = jest.fn().mockResolvedValueOnce(
      jsonResponse(500, {
        error: { code: "INTERNAL", message: "Internal server error" },
      }),
    );

    await expect(fetchMyCollections("access-1")).rejects.toThrow(
      "Internal server error",
    );
  });
});
