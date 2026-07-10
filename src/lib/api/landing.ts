import { regionApiCodes } from "@/constants/regionCodes";
import type { RegionId } from "@/constants/regions";
import { requestJson } from "./client";
import { fetchRegionDetail, type RegionDetailDto } from "./regionDetail";

export type MeSummaryDto = {
  score: number;
  nationalRank: number;
  totalUsers: number;
  progress: {
    percent: number;
    collected: number;
    total: number;
  };
};

export type ProvinceProgressDto = {
  provinceCode: RegionId;
  name: string;
  percent: number;
  collected: number;
  total: number;
};

export type LandingDto = {
  summary: MeSummaryDto;
  provinces: ProvinceProgressDto[];
};

export type RegionCodeDto = {
  code: string;
  name: string;
};

export const fetchRegions = (signal?: AbortSignal) => {
  return requestJson<RegionCodeDto[]>("/api/regions", signal);
};

const toProvinceProgress = (
  regionId: RegionId,
  detail: RegionDetailDto,
): ProvinceProgressDto => {
  return {
    provinceCode: regionId,
    name: detail.name,
    percent: detail.progress.percent,
    collected: detail.progress.collected,
    total: detail.progress.total,
  };
};

export const fetchProvinceProgress = async (signal?: AbortSignal) => {
  const entries = Object.entries(regionApiCodes) as [RegionId, string][];
  const details = await Promise.all(
    entries.map(async ([regionId, code]) => {
      const detail = await fetchRegionDetail(code, signal);
      return toProvinceProgress(regionId, detail);
    }),
  );

  return details;
};

const createSummary = (provinces: ProvinceProgressDto[]): MeSummaryDto => {
  const collected = provinces.reduce((sum, province) => {
    return sum + province.collected;
  }, 0);
  const total = provinces.reduce((sum, province) => {
    return sum + province.total;
  }, 0);
  const percent = total > 0 ? Math.round((collected / total) * 100) : 0;

  return {
    score: collected,
    nationalRank: 0,
    totalUsers: 0,
    progress: {
      percent,
      collected,
      total,
    },
  };
};

export const fetchLandingData = async (
  signal?: AbortSignal,
): Promise<LandingDto> => {
  const provinces = await fetchProvinceProgress(signal);
  const summary = createSummary(provinces);

  return {
    summary,
    provinces,
  };
};
