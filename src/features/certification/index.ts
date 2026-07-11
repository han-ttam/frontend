import { getPlace as fetchPlace, getScorePreview as fetchScorePreview } from "./api";
import { getCachedPlace, setCachedPlace } from "./cache";
import { getCompositions, getCertifyResult, getNearbyPlaces, submitVisit, MOCK_SUBMIT_SHOULD_FAIL } from "./mock";
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
export { ApiRequestError } from "./client";
export { getCompositions, submitVisit, getCertifyResult, getNearbyPlaces, MOCK_SUBMIT_SHOULD_FAIL };

export const getPlace = fetchPlace;
export const getScorePreview = fetchScorePreview;

interface PlaceAndScore {
  place: Place;
  score: ScorePreview;
}

/** 카메라 화면에서 호출 — 실제 API로 조회 후 캐시에 저장해 검토 화면이 재사용하도록 한다. */
export async function loadPlaceAndScore(placeId: string): Promise<PlaceAndScore> {
  const [place, score] = await Promise.all([fetchPlace(placeId), fetchScorePreview(placeId)]);
  const entry = { place, score };
  setCachedPlace(placeId, entry);
  return entry;
}

/** 검토 화면에서 호출 — 캐시 히트 시 네트워크 호출 없이 즉시 반환, 미스(딥링크·리로드) 시 재조회한다. */
export async function getPlaceAndScore(placeId: string): Promise<PlaceAndScore> {
  const cached = getCachedPlace(placeId);
  if (cached) return cached;
  return loadPlaceAndScore(placeId);
}
