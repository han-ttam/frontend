import { apiGet } from "./client";
import type { Place, ScorePreview } from "./types";

export function getPlace(placeId: string): Promise<Place> {
  return apiGet<Place>(`/api/places/${placeId}`);
}

export function getScorePreview(placeId: string): Promise<ScorePreview> {
  return apiGet<ScorePreview>(`/api/scoring/places/${placeId}`);
}
