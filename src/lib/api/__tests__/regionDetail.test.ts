import {
  fetchRegionDetailData,
  type RegionDetailDto,
  type RegionPlacesDto,
  type RegionRecommendedPlaceDto,
} from "../regionDetail";

const detail: RegionDetailDto = {
  code: "32",
  name: "강원특별자치도",
  description: null,
  progress: {
    percent: 0,
    collected: 0,
    total: 779,
    remaining: 779,
  },
};

const places: RegionPlacesDto = {
  items: [
    {
      placeId: "019f383f-76df-73de-9b25-ba1c03bad51a",
      name: "故박정렬여사 추모공원",
      address: "강원특별자치도 홍천군 내면 원자운길 38",
      imageUrl: null,
      visitStatus: "NONE",
    },
  ],
  counts: {
    all: 779,
    visited: 0,
    planned: 0,
  },
  nextCursor: null,
};

const recommended: RegionRecommendedPlaceDto[] = [
  {
    placeId: "019f383f-76df-73de-9b25-ba1c03bad51a",
    name: "故박정렬여사 추모공원",
    address: "강원특별자치도 홍천군 내면 원자운길 38",
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

describe("region detail API", () => {
  const originalEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  const originalFetch = global.fetch;

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = originalEnv;
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("loads region detail, filtered places, and next recommendation", async () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = "https://api.handdam.test/";
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(okJsonResponse(detail))
      .mockResolvedValueOnce(okJsonResponse(places))
      .mockResolvedValueOnce(okJsonResponse(recommended));

    global.fetch = fetchMock;

    await expect(fetchRegionDetailData("32", "VISITED")).resolves.toEqual({
      detail,
      places,
      recommended,
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://api.handdam.test/api/regions/32",
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://api.handdam.test/api/regions/32/places?status=VISITED&limit=20",
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "https://api.handdam.test/api/regions/32/recommended?limit=1",
      expect.objectContaining({ method: "GET" }),
    );
  });
});
