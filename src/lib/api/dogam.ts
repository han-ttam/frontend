import type {
  DogamRecentItem,
  DogamRegion,
  DogamTheme,
  DogamThemes,
} from "@/features/collection/types";

import { request } from "./client";

/**
 * 도감 API.
 *
 * swagger 에 응답 스키마가 없어 실기기에서 실응답을 찍어 확인했다 (2026-08-09).
 *
 * **봉투가 엔드포인트마다 다르다.**
 *   GET /api/me/dogam/regions → 배열 그 자체 (봉투 없음)
 *   GET /api/me/dogam/recent  → { items, nextCursor }
 *   GET /api/me/dogam/themes  → { items, nextCursor }
 * regions 를 봉투로 가정하면 지역별 탭이 통째로 빈다.
 */

const asString = (value: unknown) =>
  typeof value === "string" ? value : undefined;

const asNumber = (value: unknown, fallback = 0) =>
  typeof value === "number" ? value : fallback;

/** 봉투가 있든 없든 항목 배열을 꺼낸다. */
const toItemArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  const items = (value as { items?: unknown })?.items;

  return Array.isArray(items) ? items : [];
};

/**
 * 서버는 sidoCode, 앱 도메인은 provinceCode 다.
 * 앱 라우트가 /collection/region/[code] 라 이 값이 그대로 경로에 들어간다.
 */
const toRegion = (value: unknown): DogamRegion | undefined => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const item = value as Record<string, unknown>;
  const provinceCode = asString(item.sidoCode) ?? asString(item.provinceCode);
  const name = asString(item.name);

  if (!provinceCode || !name) {
    return undefined;
  }

  return {
    provinceCode,
    name,
    collected: asNumber(item.collected),
    total: asNumber(item.total),
    percent: asNumber(item.percent),
    locked: item.locked === true,
    imageUrl: asString(item.imageUrl) ?? null,
  };
};

const toRecentItem = (value: unknown): DogamRecentItem | undefined => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const item = value as Record<string, unknown>;
  // 찜 목록이 placeId 가 아니라 id 로 왔던 전례가 있어 둘 다 받는다.
  const placeId = asString(item.placeId) ?? asString(item.id);
  const name = asString(item.name);

  if (!placeId || !name) {
    return undefined;
  }

  return {
    placeId,
    name,
    imageUrl: asString(item.imageUrl) ?? null,
    collectedAt: asString(item.collectedAt) ?? "",
  };
};

const toTheme = (value: unknown): DogamTheme | undefined => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const item = value as Record<string, unknown>;
  const collectionId = asString(item.collectionId) ?? asString(item.id);
  const title = asString(item.title);

  if (!collectionId || !title) {
    return undefined;
  }

  const progress = (item.progress ?? {}) as Record<string, unknown>;

  return {
    collectionId,
    title,
    filled: asNumber(item.filled, asNumber(progress.collected)),
    total: asNumber(item.total, asNumber(progress.total)),
    thumbnails: Array.isArray(item.thumbnails)
      ? item.thumbnails.filter(
          (thumb): thumb is string => typeof thumb === "string",
        )
      : [],
  };
};

export const fetchDogamRegions = async (
  accessToken: string,
  signal?: AbortSignal,
): Promise<DogamRegion[]> => {
  const result = await request<unknown>("/api/me/dogam/regions", {
    accessToken,
    signal,
  });

  return toItemArray(result)
    .map(toRegion)
    .filter((item): item is DogamRegion => item !== undefined);
};

export const fetchDogamRecent = async (
  accessToken: string,
  signal?: AbortSignal,
): Promise<DogamRecentItem[]> => {
  const result = await request<unknown>("/api/me/dogam/recent?limit=20", {
    accessToken,
    signal,
  });

  return toItemArray(result)
    .map(toRecentItem)
    .filter((item): item is DogamRecentItem => item !== undefined);
};

export const fetchDogamThemes = async (
  accessToken: string,
  signal?: AbortSignal,
): Promise<DogamThemes> => {
  const result = await request<unknown>("/api/me/dogam/themes", {
    accessToken,
    signal,
  });

  return {
    items: toItemArray(result)
      .map(toTheme)
      .filter((item): item is DogamTheme => item !== undefined),
    nextCursor: asString((result as { nextCursor?: unknown })?.nextCursor) ?? null,
  };
};
