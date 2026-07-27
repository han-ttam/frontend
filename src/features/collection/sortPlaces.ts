import type { DogamPlace, PlaceSort } from "@/features/collection/types";

const byRecent = (a: DogamPlace, b: DogamPlace) => {
  return b.lastVerifiedAt.localeCompare(a.lastVerifiedAt);
};

/**
 * 도 상세의 정렬 칩.
 *
 * 동점 처리를 못 박아 두어야 테스트가 결정적으로 통과한다.
 * - all: 서버가 준 기본 순서 유지
 * - recent: 최근 인증 내림차순, 동점이면 이름 오름차순
 * - mostPhotos: 사진 장수 내림차순, 동점이면 최근 인증 내림차순
 */
export const sortPlaces = (
  places: DogamPlace[],
  sort: PlaceSort,
): DogamPlace[] => {
  const next = [...places];

  if (sort === "recent") {
    return next.sort((a, b) => byRecent(a, b) || a.name.localeCompare(b.name));
  }

  if (sort === "mostPhotos") {
    return next.sort((a, b) => b.photoCount - a.photoCount || byRecent(a, b));
  }

  return next;
};
