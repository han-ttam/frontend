import type { RegionId } from "./regions";

export const regionApiCodes: Record<RegionId, string> = {
  seoul: "1",
  gangwon: "32",
  chungbuk: "33",
  chungnam: "34",
  gyeongbuk: "35",
  gyeongnam: "36",
  jeonbuk: "37",
  jeonnam: "38",
  jeju: "39",
};

export const getRegionApiCode = (regionIdOrCode: string) => {
  return regionApiCodes[regionIdOrCode as RegionId] ?? regionIdOrCode;
};

export const getRegionIdByApiCode = (code: string) => {
  const entry = Object.entries(regionApiCodes).find(([, apiCode]) => {
    return apiCode === code;
  });

  return entry?.[0] as RegionId | undefined;
};
