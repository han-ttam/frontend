import type { CollectionPlace, CollectionType } from "@/features/mypage/types";

export const formatNumber = (value: number) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * 순위 표기. 아직 랭킹에 들지 못한 사용자는 서버가 null 을 준다.
 * 0 으로 떨어뜨리면 "0위"로 보이므로 장소 상세 평점과 같은 관례로 대시를 쓴다.
 */
export const formatRank = (value: number | null | undefined) => {
  return value == null ? "–" : formatNumber(value);
};

export const clampProgress = (value: number) => {
  return Math.min(1, Math.max(0, value));
};

/**
 * 수집한 곳 수를 목록에서 직접 센다.
 * 서버 progress 와 목록이 어긋날 때 사용자가 보는 목록이 정답이어야 한다.
 */
export const countCollected = (items: CollectionPlace[]) => {
  return items.filter((item) => item.visitStatus === "VISITED").length;
};

const COLLECTION_TYPE_LABELS: Record<CollectionType, string> = {
  THEME: "테마 모음",
  REGION: "지역 모음",
  EVENT: "이벤트 모음",
};

export const toCollectionTypeLabel = (type?: CollectionType | null) => {
  return (type && COLLECTION_TYPE_LABELS[type]) ?? COLLECTION_TYPE_LABELS.THEME;
};

export const toProgress = (current: number, total: number) => {
  if (total <= 0) {
    return 0;
  }

  return clampProgress(current / total);
};
