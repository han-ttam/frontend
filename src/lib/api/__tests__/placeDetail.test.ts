import {
  fetchPlaceCertifications,
  fetchPlaceCompositions,
  fetchPlaceDetail,
  fetchPlaceScoring,
  type PlaceDetailDto,
  type PlaceScoringDto,
} from "../placeDetail";

const PLACE_ID = "019f383f-76df-73de-9b25-ba1c03bad51a";

const place: PlaceDetailDto = {
  id: PLACE_ID,
  regionCode: "32_16",
  name: "故박정렬여사 추모공원",
  address: "강원특별자치도 홍천군 내면 원자운길 38",
  description: null,
  mission: null,
  tags: [],
  rarityWeight: 1,
  imageUrl: null,
  rating: null,
  ratingCount: 0,
  myRating: null,
  visitStatus: "NONE",
  lat: 37.7321800501,
  lng: 128.3606601431,
};

const scoring: PlaceScoringDto = {
  action: "CERT_PHOTO",
  basePoints: 15,
  regionWeight: 1.5,
  rarityWeight: 1,
  eventMultiplier: 1,
  estimatedPoints: 22.5,
};

const okJsonResponse = (body: unknown) => {
  return {
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue({ result: body }),
  };
};

describe("place detail API", () => {
  const originalEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = "https://api.handdam.test/";
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = originalEnv;
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("loads the place detail", async () => {
    const fetchMock = jest.fn().mockResolvedValue(okJsonResponse(place));
    global.fetch = fetchMock;

    await expect(fetchPlaceDetail(PLACE_ID)).resolves.toEqual(place);
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.handdam.test/api/places/${PLACE_ID}`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("loads the scoring preview", async () => {
    const fetchMock = jest.fn().mockResolvedValue(okJsonResponse(scoring));
    global.fetch = fetchMock;

    await expect(fetchPlaceScoring(PLACE_ID)).resolves.toEqual(scoring);
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.handdam.test/api/scoring/places/${PLACE_ID}`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("loads composition guides", async () => {
    const fetchMock = jest.fn().mockResolvedValue(okJsonResponse([]));
    global.fetch = fetchMock;

    await expect(fetchPlaceCompositions(PLACE_ID)).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.handdam.test/api/places/${PLACE_ID}/compositions`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("loads the certification feed with a limit", async () => {
    const feed = { items: [], nextCursor: null };
    const fetchMock = jest.fn().mockResolvedValue(okJsonResponse(feed));
    global.fetch = fetchMock;

    await expect(fetchPlaceCertifications(PLACE_ID)).resolves.toEqual(feed);
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.handdam.test/api/places/${PLACE_ID}/certifications?limit=8`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("fails loudly when the response has no result payload", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({}),
    });

    await expect(fetchPlaceDetail(PLACE_ID)).rejects.toThrow(
      "did not include a result payload",
    );
  });
});
