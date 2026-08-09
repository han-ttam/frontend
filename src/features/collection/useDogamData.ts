import type {
  DogamOverview,
  DogamRecentItem,
  DogamRegion,
  DogamThemes,
} from "@/features/collection/types";
import {
  fetchDogamRecent,
  fetchDogamRegions,
  fetchDogamThemes,
} from "@/lib/api/dogam";
import { fetchDogamOverview } from "@/lib/api/mypage";
import { useAuth } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";

const EMPTY_THEMES: DogamThemes = { items: [], nextCursor: null };

/**
 * 도감 탭 — 전국 요약 + 지역별/테마별/최근 수집.
 *
 * 시·도 목록만 필수다. 나머지는 실패해도 그 탭만 비고 화면은 그대로 뜬다
 * (장소 상세·마이페이지와 같은 규칙).
 */
export const useDogamData = () => {
  const { accessToken, isAuthenticated } = useAuth();
  const enabled = isAuthenticated && Boolean(accessToken);

  const regionsQuery = useQuery({
    enabled,
    queryFn: ({ signal }) => fetchDogamRegions(accessToken!, signal),
    queryKey: ["dogam-regions"],
  });

  const overviewQuery = useQuery({
    enabled,
    queryFn: ({ signal }) => fetchDogamOverview(accessToken!, signal),
    queryKey: ["mypage-dogam-overview"],
  });

  const themesQuery = useQuery({
    enabled,
    queryFn: ({ signal }) => fetchDogamThemes(accessToken!, signal),
    queryKey: ["dogam-themes"],
    retry: false,
  });

  const recentQuery = useQuery({
    enabled,
    queryFn: ({ signal }) => fetchDogamRecent(accessToken!, signal),
    queryKey: ["dogam-recent"],
    retry: false,
  });

  const regions: DogamRegion[] = regionsQuery.data ?? [];
  const recent: DogamRecentItem[] = recentQuery.data ?? [];

  // 전국 요약이 실패하면 시·도 목록을 합산해서라도 보여준다.
  const overview: DogamOverview = overviewQuery.data ?? {
    collected: regions.reduce((sum, region) => sum + region.collected, 0),
    total: regions.reduce((sum, region) => sum + region.total, 0),
    percent: 0,
  };

  return {
    isAuthenticated,
    overview: {
      ...overview,
      percent:
        overviewQuery.data?.percent ??
        (overview.total > 0
          ? Math.round((overview.collected / overview.total) * 100)
          : 0),
    },
    regions,
    themes: themesQuery.data ?? EMPTY_THEMES,
    recent,
    error: regionsQuery.error ?? null,
    isLoading: regionsQuery.isLoading,
    reload: () => {
      regionsQuery.refetch();
      overviewQuery.refetch();
      themesQuery.refetch();
      recentQuery.refetch();
    },
  };
};
