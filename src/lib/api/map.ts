import {
  type MeSummaryDto,
  type ProvinceProgressDto,
  fetchLandingData,
} from "./landing";
import { regionApiCodes } from "@/constants/regionCodes";
import { fetchRegionRecommended } from "./regionDetail";

export type TodayDiscoveryDto = {
  placeId: string;
  name: string;
  address: string;
  imageUrl: string | null;
};

export type MapDto = {
  summary: MeSummaryDto;
  provinces: ProvinceProgressDto[];
  todayDiscoveries: TodayDiscoveryDto[];
};

export const fetchTodayDiscoveries = (
  limit = 3,
  signal?: AbortSignal,
) => {
  return fetchRegionRecommended(regionApiCodes.gangwon, limit, signal);
};

export const fetchMapData = async (
  signal?: AbortSignal,
): Promise<MapDto> => {
  const [{ summary, provinces }, todayDiscoveries] = await Promise.all([
    fetchLandingData(signal),
    fetchTodayDiscoveries(3, signal),
  ]);

  return {
    summary,
    provinces,
    todayDiscoveries,
  };
};
