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
  getNearbyPlaces: jest.fn(),
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

  it("fetchPlaceAndScore가 장소와 점수를 함께 돌려준다", async () => {
    const { fetchPlaceAndScore } = loadFacade();

    const result = await fetchPlaceAndScore("p1");

    expect(result).toEqual({ place, score });
    expect(mockGetPlace).toHaveBeenCalledWith("p1");
    expect(mockGetScorePreview).toHaveBeenCalledWith("p1");
  });

  it("두 요청을 병렬로 보낸다", async () => {
    const { fetchPlaceAndScore } = loadFacade();

    let resolvePlace: (value: Place) => void = () => {};
    mockGetPlace.mockImplementationOnce(
      () =>
        new Promise<Place>((resolve) => {
          resolvePlace = resolve;
        }),
    );

    const pending = fetchPlaceAndScore("p1");

    // 장소 조회가 아직 안 끝났는데도 점수 조회는 이미 나가 있어야 병렬이다.
    expect(mockGetScorePreview).toHaveBeenCalledWith("p1");

    resolvePlace(place);
    await expect(pending).resolves.toEqual({ place, score });
  });

  it("캐시를 직접 들고 있지 않다 — 호출할 때마다 새로 조회한다", async () => {
    const { fetchPlaceAndScore } = loadFacade();

    await fetchPlaceAndScore("p1");
    await fetchPlaceAndScore("p1");

    // 중복 호출을 막는 건 react-query 의 queryKey 지 이 계층이 아니다.
    expect(mockGetPlace).toHaveBeenCalledTimes(2);
    expect(mockGetScorePreview).toHaveBeenCalledTimes(2);
  });
});
