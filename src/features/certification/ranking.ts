import { getDistance } from "geolib";

import type { NearbyPlace } from "./types";

interface Coordinates {
  lat: number;
  lng: number;
}

/** geolib 래핑 — 두 좌표 사이 거리(미터)를 계산한다. */
export function computeDistance(from: Coordinates, to: Coordinates): number {
  return getDistance(
    { latitude: from.lat, longitude: from.lng },
    { latitude: to.lat, longitude: to.lng },
  );
}

/** v1 공식: rarityWeight * (1 - min(distanceMeters / radius, 1)) — 가까울수록, 희소할수록 점수가 커진다. */
export function opportunityScore(place: NearbyPlace, radius: number): number {
  const distanceRatio = Math.min(place.distanceMeters / radius, 1);
  return place.rarityWeight * (1 - distanceRatio);
}

/** opportunityScore 내림차순, 동점이면 거리 오름차순으로 정렬한다. */
export function rankNearbyPlaces(places: NearbyPlace[], radius: number): NearbyPlace[] {
  return [...places].sort((a, b) => {
    const scoreDiff = opportunityScore(b, radius) - opportunityScore(a, radius);
    if (scoreDiff !== 0) return scoreDiff;
    return a.distanceMeters - b.distanceMeters;
  });
}
