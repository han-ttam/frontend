import { getPlace as fetchPlace, getScorePreview as fetchScorePreview, getNearbyPlaces } from "./api";
import { getCompositions, getCertifyResult, submitVisit, MOCK_SUBMIT_SHOULD_FAIL } from "./mock";
import type { Place, ScorePreview } from "./types";

export type {
  Place,
  ScorePreview,
  Composition,
  SubmitVisitPayload,
  SubmitVisitResult,
  CertifyResult,
  Visibility,
  NearbyPlace,
  NearbyPlacesQuery,
} from "./types";
export { toErrorMessage } from "./errorMessage";
export { getCompositions, submitVisit, getCertifyResult, getNearbyPlaces, MOCK_SUBMIT_SHOULD_FAIL };

export interface PlaceAndScore {
  place: Place;
  score: ScorePreview;
}

/**
 * 장소와 점수를 한 번에 조회한다. 캐시·재조회는 호출하지 않는다 —
 * 그건 usePlaceAndScore 의 queryKey 가 맡는다. 여기는 순수 fetch 계층.
 */
export async function fetchPlaceAndScore(placeId: string): Promise<PlaceAndScore> {
  const [place, score] = await Promise.all([fetchPlace(placeId), fetchScorePreview(placeId)]);
  return { place, score };
}
