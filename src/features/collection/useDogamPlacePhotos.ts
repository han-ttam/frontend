import { getMockPlacePhotos } from "@/features/collection/mockPhotoData";
import {
  applyPlaceRepresentative,
  applyPlaceRepresentativeToRegion,
} from "@/features/collection/representative";
import type {
  DogamPlacePhotos,
  DogamRegionDetail,
} from "@/features/collection/types";
import { dogamRegionDetailKey } from "@/features/collection/useDogamRegionDetail";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export const dogamPlacePhotosKey = (placeId: string) => {
  return ["dogam-place-photos", placeId] as const;
};

/**
 * 관광지 사진첩 + 관광지(2depth) 대표 지정.
 *
 * 대표를 바꾸면 사진첩 캐시와 도 상세 캐시를 **둘 다** 갱신한다.
 * 두 화면이 같은 사실을 나눠 갖고 있어, 도 상세로 돌아갔을 때 카드 표지가
 * 바뀌어 있어야 하기 때문이다 (FR-012).
 */
export const useDogamPlacePhotos = (placeId: string | undefined) => {
  const queryClient = useQueryClient();
  const enabled = Boolean(placeId);

  const photosQuery = useQuery({
    enabled,
    queryFn: async (): Promise<DogamPlacePhotos | null> => {
      return getMockPlacePhotos(placeId!) ?? null;
    },
    queryKey: dogamPlacePhotosKey(placeId ?? ""),
  });

  const data = photosQuery.data ?? undefined;

  const setPlaceRepresentative = useCallback(
    (photoId: string) => {
      if (!placeId || !data) {
        return;
      }

      // 변경이 없으면(이미 대표거나 후보 밖) 같은 참조가 돌아온다.
      if (applyPlaceRepresentative(data, photoId) === data) {
        return;
      }

      const provinceCode = data.place.provinceCode;

      queryClient.setQueryData<DogamPlacePhotos | null>(
        dogamPlacePhotosKey(placeId),
        (current) => (current ? applyPlaceRepresentative(current, photoId) : current),
      );

      // 도 상세를 아직 보지 않았다면 캐시가 없다. 그 경우 갱신할 것도 없다.
      queryClient.setQueryData<DogamRegionDetail | null>(
        dogamRegionDetailKey(provinceCode),
        (current) =>
          current
            ? applyPlaceRepresentativeToRegion(current, placeId, photoId)
            : current,
      );
    },
    [data, placeId, queryClient],
  );

  return {
    data,
    error: photosQuery.error ?? null,
    isLoading: photosQuery.isLoading,
    setPlaceRepresentative,
  };
};
