import type { Place, ScorePreview } from "./types";
import type * as CertificationFacade from "./index";

const place: Place = {
  id: "p1",
  name: "영금정",
  address: null,
  description: null,
  mission: null,
  tags: [],
  rarityWeight: 1,
};

const score: ScorePreview = {
  action: "CERT_PHOTO",
  basePoints: 15,
  regionWeight: 1.5,
  rarityWeight: 1,
  eventMultiplier: 1,
  estimatedPoints: 22.5,
};

const mockGetPlace = jest.fn().mockResolvedValue(place);
const mockGetScorePreview = jest.fn().mockResolvedValue(score);

jest.mock("./api", () => ({
  getPlace: (...args: unknown[]) => mockGetPlace(...args),
  getScorePreview: (...args: unknown[]) => mockGetScorePreview(...args),
}));

function loadFacade(): typeof CertificationFacade {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("./index");
}

describe("certification facade", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("loadPlaceAndScore fetches both real endpoints and caches the result", async () => {
    const { loadPlaceAndScore, getPlaceAndScore } = loadFacade();

    const result = await loadPlaceAndScore("p1");

    expect(result).toEqual({ place, score });
    expect(mockGetPlace).toHaveBeenCalledWith("p1");
    expect(mockGetScorePreview).toHaveBeenCalledWith("p1");

    // cache hit: getPlaceAndScore must not call the API again
    jest.clearAllMocks();
    const cached = await getPlaceAndScore("p1");
    expect(cached).toEqual({ place, score });
    expect(mockGetPlace).not.toHaveBeenCalled();
    expect(mockGetScorePreview).not.toHaveBeenCalled();
  });

  it("getPlaceAndScore refetches on a cache miss (e.g. deep link straight into review)", async () => {
    const { getPlaceAndScore } = loadFacade();

    const result = await getPlaceAndScore("never-cached-id");

    expect(result).toEqual({ place, score });
    expect(mockGetPlace).toHaveBeenCalledWith("never-cached-id");
    expect(mockGetScorePreview).toHaveBeenCalledWith("never-cached-id");
  });
});
