import type {
  DogamPlacePhotos,
  DogamRegionDetail,
} from "@/features/collection/types";

/**
 * 대표 사진 지정의 순수 로직.
 *
 * 캐시 갱신을 훅에서 인라인으로 쓰면 검증하려고 훅을 렌더해야 한다.
 * 두 단계 대표의 범위 규칙(I1·I2)과 독립성(I6)이 이 기능의 핵심이라
 * 화면 없이 확인할 수 있게 함수로 뺐다.
 *
 * 모든 함수는 **바뀌지 않으면 입력을 그대로 돌려준다.**
 * 호출부가 참조 비교로 "변경 없음"을 알 수 있다.
 */

/** 관광지(2depth) 대표 지정. 후보는 그 관광지 사진뿐이다 (I1). */
export const applyPlaceRepresentative = (
  current: DogamPlacePhotos,
  photoId: string,
): DogamPlacePhotos => {
  if (current.place.representativePhotoId === photoId) {
    return current;
  }

  if (!current.photos.some((photo) => photo.photoId === photoId)) {
    return current;
  }

  return {
    ...current,
    place: { ...current.place, representativePhotoId: photoId },
  };
};

/**
 * 도 상세 캐시에서 특정 관광지의 표지를 갱신한다 (FR-012).
 * 도 대표(region.representativePhotoId)는 건드리지 않는다 (I6).
 */
export const applyPlaceRepresentativeToRegion = (
  current: DogamRegionDetail,
  placeId: string,
  photoId: string,
): DogamRegionDetail => {
  const target = current.places.find((place) => place.placeId === placeId);

  if (!target || target.representativePhotoId === photoId) {
    return current;
  }

  return {
    ...current,
    places: current.places.map((place) =>
      place.placeId === placeId
        ? { ...place, representativePhotoId: photoId }
        : place,
    ),
  };
};

/**
 * 도(1depth) 대표 지정. 후보는 그 도 **모든 관광지**의 사진이다 (I2).
 * 관광지 대표들은 건드리지 않는다 (I6).
 */
export const applyRegionRepresentative = (
  current: DogamRegionDetail,
  photoId: string,
  regionPhotoIds: readonly string[],
): DogamRegionDetail => {
  if (current.region.representativePhotoId === photoId) {
    return current;
  }

  if (!regionPhotoIds.includes(photoId)) {
    return current;
  }

  return {
    ...current,
    region: { ...current.region, representativePhotoId: photoId },
  };
};
