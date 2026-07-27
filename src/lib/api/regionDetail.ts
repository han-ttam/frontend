import { requestJson } from "./client";

export type RegionProgressDto = {
  percent: number;
  collected: number;
  total: number;
  remaining: number;
};

export type RegionDetailDto = {
  code: string;
  name: string;
  description: string | null;
  progress: RegionProgressDto;
};

export type RegionPlaceStatusDto = "VISITED" | "NONE";

export type RegionPlaceDto = {
  placeId: string;
  name: string;
  address: string;
  imageUrl: string | null;
  visitStatus: RegionPlaceStatusDto;
  isFavorite?: boolean;
};

export type RegionPlacesStatusParam = "ALL" | "VISITED";

export type RegionPlacesDto = {
  items: RegionPlaceDto[];
  counts: {
    all: number;
    visited: number;
    planned: number;
  };
  nextCursor: string | null;
};

export type RegionRecommendedPlaceDto = {
  placeId: string;
  name: string;
  address: string;
  imageUrl: string | null;
  isFavorite?: boolean;
};

export type RegionDetailDataDto = {
  detail: RegionDetailDto;
  places: RegionPlacesDto;
  recommended: RegionRecommendedPlaceDto[];
};

export const fetchRegionDetail = (
  code: string,
  signal?: AbortSignal,
) => {
  return requestJson<RegionDetailDto>(`/api/regions/${code}`, signal);
};

export const fetchRegionPlaces = (
  code: string,
  options: {
    status?: RegionPlacesStatusParam;
    cursor?: string;
    limit?: number;
  } = {},
  signal?: AbortSignal,
) => {
  const searchParams = new URLSearchParams({
    status: options.status ?? "ALL",
  });

  if (options.cursor) {
    searchParams.set("cursor", options.cursor);
  }

  if (options.limit != null) {
    searchParams.set("limit", String(options.limit));
  }

  return requestJson<RegionPlacesDto>(
    `/api/regions/${code}/places?${searchParams.toString()}`,
    signal,
  );
};

export const fetchRegionRecommended = (
  code: string,
  limit = 1,
  signal?: AbortSignal,
) => {
  return requestJson<RegionRecommendedPlaceDto[]>(
    `/api/regions/${code}/recommended?limit=${limit}`,
    signal,
  );
};

export const fetchRegionDetailData = async (
  code: string,
  status: RegionPlacesStatusParam = "ALL",
  signal?: AbortSignal,
): Promise<RegionDetailDataDto> => {
  const [detail, places, recommended] = await Promise.all([
    fetchRegionDetail(code, signal),
    fetchRegionPlaces(code, { status, limit: 20 }, signal),
    fetchRegionRecommended(code, 1, signal),
  ]);

  return {
    detail,
    places,
    recommended,
  };
};
