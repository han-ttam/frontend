import type { Place, ScorePreview } from "./types";

interface CachedEntry {
  place: Place;
  score: ScorePreview;
}

const store = new Map<string, CachedEntry>();

export function setCachedPlace(placeId: string, entry: CachedEntry): void {
  store.set(placeId, entry);
}

export function getCachedPlace(placeId: string): CachedEntry | undefined {
  return store.get(placeId);
}
