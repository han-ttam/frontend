import { ApiError, requestJson } from "@/lib/api/client";

import type { NearbyPlace, NearbyPlacesQuery, Place, ScorePreview } from "./types";

const TIMEOUT_MS = 10_000;

/** HTTP 응답이 아예 없는 실패(타임아웃·네트워크)에 붙일 status — 실제 상태코드가 아님을 뜻한다. */
const NO_HTTP_STATUS = 0;

/**
 * GET /api/places/nearby 는 rarityWeight 를 주지 않는다. 장소별 상세(N+1)로 채울 수도 있지만
 * 현재 백엔드가 모든 장소를 1로 시딩해 둬서 20번을 더 불러도 얻는 신호가 없다 — 그래서 1로 채운다.
 * 백엔드가 실제 값을 시딩하면 이 상수를 응답 필드로 바꾸면 된다.
 */
const DEFAULT_RARITY_WEIGHT = 1;

/**
 * GET /api/places/nearby 의 원본 응답 — 프론트 NearbyPlace 와 필드명이 달라 매핑한다.
 * address·regionCode·thumbnailUrl 은 지금 카드가 쓰지 않지만, 서버가 주는 계약을 그대로 적어 둔다.
 */
interface NearbyPlaceResponse {
  placeId: string;
  name: string;
  address: string;
  distanceM: number;
  regionCode: string;
  thumbnailUrl: string | null;
}

/**
 * 공용 클라이언트(@/lib/api/client)에 타임아웃과 네트워크 오류 정규화를 덧씌운다.
 * 공용 request 는 fetch 가 던지는 raw TypeError 를 그대로 흘려보내는데, 인증 플로우 화면들은
 * 어떤 실패든 ApiError 하나로 받아야 error.code 로 문구를 고를 수 있다.
 */
async function get<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    return await requestJson<T>(path, controller.signal);
  } catch (err) {
    // message 는 개발자용 — 사용자에게 보여줄 한글 문구는 toErrorMessage 가 code 로 고른다.
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError(`GET ${path} aborted after ${TIMEOUT_MS}ms`, "TIMEOUT", NO_HTTP_STATUS);
    }
    throw new ApiError(`GET ${path} failed before a response arrived`, "NETWORK_ERROR", NO_HTTP_STATUS);
  } finally {
    clearTimeout(timeout);
  }
}

export function getPlace(placeId: string): Promise<Place> {
  return get<Place>(`/api/places/${placeId}`);
}

export function getScorePreview(placeId: string): Promise<ScorePreview> {
  return get<ScorePreview>(`/api/scoring/places/${placeId}`);
}

/** 서버가 이미 distanceM 오름차순으로 정렬해 주므로 프론트에서 다시 정렬하지 않는다. */
export async function getNearbyPlaces(query: NearbyPlacesQuery): Promise<NearbyPlace[]> {
  const params = new URLSearchParams({
    lat: String(query.lat),
    lng: String(query.lng),
    radius: String(query.radius),
    limit: String(query.limit),
  });

  const items = await get<NearbyPlaceResponse[]>(`/api/places/nearby?${params}`);

  // 배열이 아니면 아래 map 이 raw TypeError 를 던져 ApiError 계약이 깨진다 — 여기서 막는다.
  if (!Array.isArray(items)) {
    throw new ApiError("nearby response was not an array", "INVALID_RESPONSE", NO_HTTP_STATUS);
  }

  return items.map((item) => ({
    id: item.placeId,
    name: item.name,
    rarityWeight: DEFAULT_RARITY_WEIGHT,
    distanceMeters: item.distanceM,
  }));
}
