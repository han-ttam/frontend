import {
  fetchRegionDetail,
  fetchRegionPlaces,
  fetchRegionRecommended,
  type RegionDetailDataDto,
  type RegionPlacesDto,
  type RegionPlacesStatusParam,
} from "@/lib/api/regionDetail";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const PAGE_SIZE = 20;

const emptyPlaces: RegionPlacesDto = {
  counts: {
    all: 0,
    planned: 0,
    visited: 0,
  },
  items: [],
  nextCursor: null,
};

export const useRegionDetailData = (
  code: string | undefined,
  status: RegionPlacesStatusParam,
) => {
  const enabled = Boolean(code);

  const detailQuery = useQuery({
    enabled,
    queryFn: ({ signal }) => fetchRegionDetail(code!, signal),
    queryKey: ["region-detail", code],
  });

  const recommendedQuery = useQuery({
    enabled,
    queryFn: ({ signal }) => fetchRegionRecommended(code!, 1, signal),
    queryKey: ["region-recommended", code],
  });

  const placesQuery = useInfiniteQuery<RegionPlacesDto, Error>({
    enabled,
    getNextPageParam: (lastPage: RegionPlacesDto) =>
      lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      fetchRegionPlaces(
        code!,
        {
          cursor: pageParam as string | undefined,
          limit: PAGE_SIZE,
          status,
        },
        signal,
      ),
    queryKey: ["region-places", code, status],
  });

  const places = useMemo<RegionPlacesDto | undefined>(() => {
    if (!placesQuery.data) {
      return undefined;
    }

    const pages = placesQuery.data.pages;
    const firstPage = pages[0] ?? emptyPlaces;
    const lastPage = pages[pages.length - 1] ?? firstPage;

    return {
      counts: firstPage.counts,
      items: pages.flatMap((page) => page.items),
      nextCursor: lastPage.nextCursor,
    };
  }, [placesQuery.data]);

  const data = useMemo<RegionDetailDataDto | undefined>(() => {
    if (!detailQuery.data || !places) {
      return undefined;
    }

    return {
      detail: detailQuery.data,
      places,
      recommended: recommendedQuery.data ?? [],
    };
  }, [detailQuery.data, places, recommendedQuery.data]);

  const error =
    detailQuery.error ?? placesQuery.error ?? recommendedQuery.error ?? null;

  return {
    data,
    error,
    isLoading:
      detailQuery.isLoading || placesQuery.isLoading || recommendedQuery.isLoading,
    isLoadingMore: placesQuery.isFetchingNextPage,
    loadMore: () => {
      if (placesQuery.hasNextPage && !placesQuery.isFetchingNextPage) {
        placesQuery.fetchNextPage();
      }
    },
    reload: () => {
      detailQuery.refetch();
      recommendedQuery.refetch();
      placesQuery.refetch();
    },
  };
};
