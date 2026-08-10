import type {
  MypageCollectionItem,
  MypageProfile,
  MypageRanking,
  RankingPeriod,
  RankingTraveler,
} from "@/features/mypage/types";
import {
  fetchDogamOverview,
  fetchMyCollections,
  fetchMyProfile,
  fetchRankings,
} from "@/lib/api/mypage";
import { useAuth } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";

/**
 * 서버 응답 중 배열 항목의 형태는 확인하지 못했다(값이 비어 있어서).
 * 예상과 다르면 화면이 깨지는 대신 그 항목만 버린다.
 */
const toTraveler = (value: unknown): RankingTraveler | undefined => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const item = value as Record<string, unknown>;

  if (
    typeof item.rank !== "number" ||
    typeof item.handle !== "string" ||
    typeof item.score !== "number"
  ) {
    return undefined;
  }

  return {
    rank: item.rank,
    handle: item.handle,
    score: item.score,
    dogamPercent: typeof item.dogamPercent === "number" ? item.dogamPercent : 0,
    avatarUrl: typeof item.avatarUrl === "string" ? item.avatarUrl : null,
    badge: typeof item.badge === "string" ? item.badge : null,
  };
};

const toCollectionItem = (
  value: unknown,
): MypageCollectionItem | undefined => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const item = value as Record<string, unknown>;
  const id = typeof item.id === "string" ? item.id : undefined;
  const title = typeof item.title === "string" ? item.title : undefined;

  if (!id || !title) {
    return undefined;
  }

  const progress = (item.progress ?? {}) as Record<string, unknown>;

  return {
    id,
    title,
    filled:
      typeof item.filled === "number"
        ? item.filled
        : typeof progress.collected === "number"
          ? progress.collected
          : 0,
    total:
      typeof item.total === "number"
        ? item.total
        : typeof progress.total === "number"
          ? progress.total
          : 0,
    coverImageUrl:
      typeof item.coverImageUrl === "string" ? item.coverImageUrl : null,
    thumbnails: Array.isArray(item.thumbnails)
      ? item.thumbnails.filter(
          (thumb): thumb is string => typeof thumb === "string",
        )
      : [],
  };
};

export const useMypageData = (period: RankingPeriod) => {
  const { accessToken, isAuthenticated } = useAuth();
  const enabled = isAuthenticated && Boolean(accessToken);

  const profileQuery = useQuery({
    enabled,
    queryFn: ({ signal }) => fetchMyProfile(accessToken!, signal),
    queryKey: ["mypage-profile"],
  });

  const overviewQuery = useQuery({
    enabled,
    queryFn: ({ signal }) => fetchDogamOverview(accessToken!, signal),
    queryKey: ["mypage-dogam-overview"],
  });

  const rankingQuery = useQuery({
    enabled,
    queryFn: ({ signal }) => fetchRankings(period, accessToken!, signal),
    queryKey: ["mypage-rankings", period],
  });

  // 2026-08-09 현재 서버가 500 을 준다. 실패해도 화면을 막지 않고 모음만 빈다.
  const collectionsQuery = useQuery({
    enabled,
    queryFn: ({ signal }) => fetchMyCollections(accessToken!, signal),
    queryKey: ["mypage-collections"],
    retry: false,
  });

  const profile: MypageProfile | undefined = profileQuery.data
    ? { ...profileQuery.data, bio: null, location: null }
    : undefined;

  const ranking: MypageRanking | undefined = rankingQuery.data
    ? {
        topPercent: rankingQuery.data.topPercent,
        top3: rankingQuery.data.top3
          .map(toTraveler)
          .filter((item): item is RankingTraveler => item !== undefined),
        leaderboard: {
          items: rankingQuery.data.leaderboard.items
            .map(toTraveler)
            .filter((item): item is RankingTraveler => item !== undefined),
          nextCursor: rankingQuery.data.leaderboard.nextCursor,
        },
        me: rankingQuery.data.me,
      }
    : undefined;

  const collections = (collectionsQuery.data?.items ?? [])
    .map(toCollectionItem)
    .filter((item): item is MypageCollectionItem => item !== undefined);

  return {
    isAuthenticated,
    profile,
    ranking,
    collections,
    overall: overviewQuery.data
      ? {
          collected: overviewQuery.data.collected,
          total: overviewQuery.data.total,
        }
      : undefined,
    // 프로필만 필수다. 나머지가 실패하면 그 섹션만 빈다.
    error: profileQuery.error ?? null,
    isLoading: profileQuery.isLoading,
    reload: () => {
      profileQuery.refetch();
      overviewQuery.refetch();
      rankingQuery.refetch();
      collectionsQuery.refetch();
    },
  };
};
