import { regionApiCodes } from "@/constants/regionCodes";
import { getApiBaseUrl } from "../client";
import { fetchLandingData } from "../landing";
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

const okJsonResponse = (body: unknown) => {
  return {
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue({ result: body }),
  };
};

describe("landing API", () => {
  const originalEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  const originalFetch = global.fetch;

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = originalEnv;
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("uses the Swagger API base URL by default", () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;

    expect(getApiBaseUrl()).toBe(
      "https://api.handdam.store/api",
    );
  });

  it("loads province progress from region detail endpoints", async () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = "https://api.handdam.test/";
    const regionCodes = Object.values(regionApiCodes);
    const fetchMock = jest.fn();

    regionCodes.forEach((code, index) => {
      fetchMock.mockResolvedValueOnce(
        okJsonResponse(createRegionDetail(code, index)),
      );
    });

    global.fetch = fetchMock;

    const data = await fetchLandingData();

    expect(data.provinces).toHaveLength(regionCodes.length);
    expect(data.summary.progress.total).toBe(regionCodes.length * 10);
    expect(data.summary.progress.collected).toBe(45);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://api.handdam.test/api/regions/1",
      expect.objectContaining({ method: "GET" }),
    );
  });
});
