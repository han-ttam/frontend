import { getDistance } from "geolib";

import type { NearbyPlace } from "./types";

/**
 * 현재 호출자가 없다 — 백엔드가 모든 장소의 rarityWeight 를 1로 시딩해 둬서, 이 공식이 만드는 순서가
 * 서버가 이미 주는 거리순과 똑같기 때문이다(useNearbyPlaces 가 호출을 뺐다). 실제 값이 시딩되면
 * 다시 붙일 수 있게 남겨 둔다. 테스트가 통과한다고 해서 지금 앱에서 쓰이는 코드는 아니다.
 */

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
