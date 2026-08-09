interface CachedLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

const TTL_MS = 60_000;
let cached: CachedLocation | null = null;

/**
 * TTL(60초) 안이면 마지막 위치를 반환, 만료됐으면 null — 재진입 시 GPS 재요청 없이 즉시 렌더하기 위함.
 * 여기서 재는 건 "이 좌표를 캐시에 넣은 시각"이지 기기가 GPS fix 를 얻은 시각이 아니다.
 * fix 자체의 나이는 useNearbyPlaces 의 LAST_KNOWN_MAX_AGE_MS(5분)가 따로 제한한다.
 */
export function getCachedLocation(): CachedLocation | null {
  if (!cached) return null;
  if (Date.now() - cached.timestamp > TTL_MS) return null;
  return cached;
}

export function setCachedLocation(lat: number, lng: number): void {
  cached = { lat, lng, timestamp: Date.now() };
}

export function clearLocationCache(): void {
  cached = null;
}
