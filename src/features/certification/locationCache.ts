interface CachedLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

const TTL_MS = 60_000;
let cached: CachedLocation | null = null;

/** TTL(60초) 안이면 마지막 위치를 반환, 만료됐으면 null — 재진입 시 GPS 재요청 없이 즉시 렌더하기 위함. */
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
