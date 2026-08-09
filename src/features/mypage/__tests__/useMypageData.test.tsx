import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";

import { useMypageData } from "../useMypageData";

const mockFetchMyProfile = jest.fn();
const mockFetchDogamOverview = jest.fn();
const mockFetchRankings = jest.fn();
const mockFetchMyCollections = jest.fn();

let mockAuth: { isAuthenticated: boolean; accessToken?: string } = {
  isAuthenticated: true,
  accessToken: "access-1",
};

jest.mock("@/lib/api/mypage", () => ({
  fetchMyProfile: (...args: unknown[]) => mockFetchMyProfile(...args),
  fetchDogamOverview: (...args: unknown[]) => mockFetchDogamOverview(...args),
  fetchRankings: (...args: unknown[]) => mockFetchRankings(...args),
  fetchMyCollections: (...args: unknown[]) => mockFetchMyCollections(...args),
}));

jest.mock("@/stores/authStore", () => ({
  useAuth: () => mockAuth,
}));

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

const emptyRankings = {
  topPercent: null,
  top3: [],
  leaderboard: { items: [], nextCursor: null },
  me: { rank: null, score: 0, dogamPercent: 0, pointsToNext: 0 },
};

const traveler = {
  rank: 1,
  handle: "여행왕",
  score: 980,
  dogamPercent: 62,
  avatarUrl: null,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { gcTime: 0, retry: false, staleTime: 0 },
      mutations: { gcTime: 0, retry: false },
    },
  });

  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return Wrapper;
};

describe("useMypageData", () => {
  beforeEach(() => {
    mockAuth = { isAuthenticated: true, accessToken: "access-1" };
    mockFetchMyProfile.mockReset().mockResolvedValue(profile);
    mockFetchDogamOverview
      .mockReset()
      .mockResolvedValue({ percent: 0, collected: 0, total: 7658 });
    mockFetchRankings.mockReset().mockResolvedValue(emptyRankings);
    mockFetchMyCollections
      .mockReset()
      .mockResolvedValue({ items: [], nextCursor: null });
  });

  it("게스트면 아무것도 조회하지 않는다", async () => {
    mockAuth = { isAuthenticated: false };

    const { result } = await renderHook(() => useMypageData("CUMULATIVE"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(mockFetchMyProfile).not.toHaveBeenCalled();
  });

  it("프로필과 전국 진행률을 합쳐서 돌려준다", async () => {
    const { result } = await renderHook(() => useMypageData("CUMULATIVE"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.profile).toBeDefined();
    });

    expect(result.current.profile?.displayName).toBe("최서윤");
    expect(result.current.profile?.nationalRank).toBeNull();
    expect(result.current.overall).toEqual({ collected: 0, total: 7658 });
  });

  it("프로필 조회가 실패하면 화면 전체 에러로 올린다", async () => {
    mockFetchMyProfile.mockRejectedValue(new Error("HTTP 500"));

    const { result } = await renderHook(() => useMypageData("CUMULATIVE"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });

  it("모음 목록이 500 이어도 화면은 살아 있고 모음만 빈다", async () => {
    mockFetchMyCollections.mockRejectedValue(
      new Error("Internal server error"),
    );

    const { result } = await renderHook(() => useMypageData("CUMULATIVE"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.profile).toBeDefined();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.collections).toEqual([]);
  });

  it("랭킹 항목에 필수 필드가 없으면 버린다", async () => {
    // top3·leaderboard 항목 형태는 서버에서 확인하지 못했다.
    // 예상과 다르면 화면이 깨지는 대신 조용히 비어야 한다.
    mockFetchRankings.mockResolvedValue({
      ...emptyRankings,
      top3: [traveler, { 이상한필드: 1 }, null],
      leaderboard: { items: [traveler], nextCursor: null },
    });

    const { result } = await renderHook(() => useMypageData("CUMULATIVE"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.ranking).toBeDefined();
    });

    expect(result.current.ranking?.top3).toHaveLength(1);
    expect(result.current.ranking?.top3[0].handle).toBe("여행왕");
    expect(result.current.ranking?.leaderboard.items).toHaveLength(1);
  });

  it("기간을 바꾸면 그 기간으로 다시 조회한다", async () => {
    await renderHook(() => useMypageData("MONTHLY"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockFetchRankings).toHaveBeenCalled();
    });

    expect(mockFetchRankings.mock.calls[0][0]).toBe("MONTHLY");
  });
});
