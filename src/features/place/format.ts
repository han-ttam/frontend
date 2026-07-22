/** 서버가 미션을 안 주는 장소가 많아서, 없으면 공통 안내 문구를 보여준다. */
export const DEFAULT_MISSION =
  "이 장소의 대표적인 모습이 담긴 사진을 인증해주세요!";

export const RATING_EMPTY = "–";

/** 가중치는 소수점이 있을 때만 표시한다. 1 → ×1, 1.5 → ×1.5 */
export const formatWeight = (weight: number) => {
  if (!Number.isFinite(weight)) {
    return `×${1}`;
  }

  return `×${Number(weight.toFixed(2))}`;
};

/** 평점이 없으면(null / 0명) 숫자 대신 대시를 보여준다. */
export const formatRating = (
  rating: number | null,
  ratingCount: number,
) => {
  if (rating == null || ratingCount <= 0) {
    return RATING_EMPTY;
  }

  return rating.toFixed(1);
};

/** 예상 점수는 소수점이 나올 수 있다 (기본 15 × 지역 1.5 = 22.5). */
export const formatPoints = (points: number) => {
  if (!Number.isFinite(points)) {
    return "0";
  }

  return String(Number(points.toFixed(1)));
};

export const formatTag = (tag: string) => {
  return tag.startsWith("#") ? tag : `#${tag}`;
};

export const getMissionText = (mission: string | null) => {
  const trimmed = mission?.trim();

  return trimmed ? trimmed : DEFAULT_MISSION;
};
