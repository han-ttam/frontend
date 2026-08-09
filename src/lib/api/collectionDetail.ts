import type {
  CollectionDetail,
  CollectionPlace,
  CollectionType,
} from "@/features/mypage/types";

import { request } from "./client";

/**
 * GET /api/collections/{id} — 테마 상세 (장소 목록)
 *
 * bearer 없이도 열리는 공개 엔드포인트다(없는 id 는 401 이 아니라 404).
 * 다만 **응답 형태는 아직 확인하지 못했다.** 모음 id 를 얻으려면
 * `/api/me/collections` 가 필요한데 2026-08-09 현재 그쪽이 500 이다.
 *
 * 그래서 필드를 하나씩 검증해서 담고, 예상과 다르면 화면이 깨지는 대신
 * 그 항목만 빠지게 한다. 서버가 고쳐지면 실응답으로 다시 맞춰야 한다.
 */

const COLLECTION_TYPES: CollectionType[] = ["THEME", "REGION", "EVENT"];

const asString = (value: unknown) =>
  typeof value === "string" ? value : undefined;

const asNumber = (value: unknown) =>
  typeof value === "number" ? value : undefined;

const toPlace = (value: unknown): CollectionPlace | undefined => {
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
    name: name,
    address: asString(item.address) ?? null,
    imageUrl: asString(item.imageUrl) ?? null,
    visitStatus: item.visitStatus === "VISITED" ? "VISITED" : "NONE",
  };
};

const toCollectionDetail = (value: unknown, id: string): CollectionDetail => {
  const raw = (value ?? {}) as Record<string, unknown>;
  const progress = (raw.progress ?? {}) as Record<string, unknown>;
  const rawItems = Array.isArray(raw.items) ? raw.items : [];

  const items = rawItems
    .map(toPlace)
    .filter((item): item is CollectionPlace => item !== undefined);

  const type = COLLECTION_TYPES.find((candidate) => candidate === raw.type);

  return {
    id: asString(raw.id) ?? id,
    title: asString(raw.title) ?? "",
    description: asString(raw.description) ?? null,
    type: type ?? "THEME",
    coverImageUrl: asString(raw.coverImageUrl) ?? null,
    progress: {
      collected:
        asNumber(progress.collected) ??
        items.filter((item) => item.visitStatus === "VISITED").length,
      total: asNumber(progress.total) ?? items.length,
    },
    items,
    nextCursor: asString(raw.nextCursor) ?? null,
  };
};

export const fetchCollectionDetail = async (
  id: string,
  signal?: AbortSignal,
): Promise<CollectionDetail> => {
  const result = await request<unknown>(`/api/collections/${id}`, { signal });

  return toCollectionDetail(result, id);
};
