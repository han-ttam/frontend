import { request } from "./client";

/**
 * 마이페이지 API.
 *
 * swagger 에 응답 스키마가 없어서(89개 중 2개, 전부 요청 DTO) 아래 타입은
 * **실기기에서 실제 응답을 찍어 확인한 것**이다 (2026-08-09).
 * 확인하지 못한 부분은 unknown 으로 두고 훅에서 검증한다 — 배열이 비어 있어
 * 항목 형태를 볼 수 없었기 때문이다.
 */

/** GET /api/me/profile — 실응답 확인 완료 */
export type MyProfileDto = {
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  level: number;
  exp: number;
  expForNextLevel: number;
  dogamPercent: number;
  visitedCount: number;
  /** 랭킹에 들지 못한 신규 사용자는 null 이다. */
  nationalRank: number | null;
  totalUsers: number;
};

/** GET /api/me/dogam/overview — 실응답 확인 완료 */
export type DogamOverviewDto = {
  percent: number;
  collected: number;
  total: number;
};

/** GET /api/rankings — 봉투는 확인 완료, top3·leaderboard.items 항목 형태는 미확인 */
export type RankingsDto = {
  topPercent: number | null;
  top3: unknown[];
  leaderboard: {
    items: unknown[];
    nextCursor: string | null;
  };
  me: {
    rank: number | null;
    score: number;
    dogamPercent: number;
    pointsToNext: number;
  };
};

/**
 * GET /api/me/collections — **미확인**.
 * 2026-08-09 현재 서버가 500(Internal server error)을 준다. 파라미터를 빼도,
 * limit 을 바꿔도 같다. 서버에 컬렉션 데이터가 아직 없는 것으로 보인다
 * (`/api/me/dogam/themes` 도 items: []).
 */
export type MyCollectionsDto = {
  items?: unknown[];
  nextCursor?: string | null;
};

export type RankingPeriodParam = "CUMULATIVE" | "MONTHLY";

const RANKING_PAGE_SIZE = 20;

export const fetchMyProfile = (accessToken: string, signal?: AbortSignal) => {
  return request<MyProfileDto>("/api/me/profile", { accessToken, signal });
};

export const fetchDogamOverview = (
  accessToken: string,
  signal?: AbortSignal,
) => {
  return request<DogamOverviewDto>("/api/me/dogam/overview", {
    accessToken,
    signal,
  });
};

export const fetchRankings = (
  period: RankingPeriodParam,
  accessToken: string,
  signal?: AbortSignal,
) => {
  const query = new URLSearchParams({
    period,
    limit: String(RANKING_PAGE_SIZE),
  });

  return request<RankingsDto>(`/api/rankings?${query.toString()}`, {
    accessToken,
    signal,
  });
};

export const fetchMyCollections = (
  accessToken: string,
  signal?: AbortSignal,
) => {
  return request<MyCollectionsDto>("/api/me/collections", {
    accessToken,
    signal,
  });
};
