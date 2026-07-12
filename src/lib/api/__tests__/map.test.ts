import { regionApiCodes } from "@/constants/regionCodes";
import { fetchMapData, type TodayDiscoveryDto } from "../map";
import type { RegionDetailDto } from "../regionDetail";

const createRegionDetail = (
  code: string,
  index: number,
): RegionDetailDto => {
  return {
    code,
    name: `Region ${code}`,
    description: null,
    progress: {
      percent: 10,
      collected: index + 1,
      total: 10,
      remaining: 9 - index,
    },
  };
};

const todayDiscoveries: TodayDiscoveryDto[] = [
  {
    placeId: "gangwon-place",
    name: "Gangwon Place",
    address: "Gangwon",
    imageUrl: null,
  },
];

const okJsonResponse = (body: unknown) => {
  return {
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue({ result: body }),
  };
};

describe("map API", () => {
  const originalEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  const originalFetch = global.fetch;

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = originalEnv;
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("loads map summary, province progress, and region recommendations", async () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = "https://api.handdam.test/";
    const regionCodes = Object.values(regionApiCodes);
    const fetchMock = jest.fn();

    regionCodes.forEach((code, index) => {
      fetchMock.mockResolvedValueOnce(
        okJsonResponse(createRegionDetail(code, index)),
      );
    });
    fetchMock.mockResolvedValueOnce(okJsonResponse(todayDiscoveries));

    global.fetch = fetchMock;

    const data = await fetchMapData();

    expect(data.provinces).toHaveLength(regionCodes.length);
    expect(data.todayDiscoveries).toEqual(todayDiscoveries);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://api.handdam.test/api/regions/32/recommended?limit=3",
      expect.objectContaining({ method: "GET" }),
    );
  });
});
