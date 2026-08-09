import {
  getMockRegionDetail,
  getMockRegionPhotos,
} from "@/features/collection/mockPhotoData";
import { applyRegionRepresentative } from "@/features/collection/representative";
import type {
  DogamPhoto,
  DogamRegionDetail,
} from "@/features/collection/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

export const dogamRegionDetailKey = (provinceCode: string) => {
  return ["dogam-region-detail", provinceCode] as const;
};

export const dogamRegionPhotosKey = (provinceCode: string) => {
  return ["dogam-region-photos", provinceCode] as const;
};

/**
 * 도감 도 상세.
 *
 * 목데이터 단계라 queryFn 이 동기 값을 돌려주지만, 캐시를 상태 저장소로 쓰고 있어
 * 화면을 오가도 대표 지정이 유지된다(FR-023). 실제 API 가 나오면 queryFn 만 바꾸면 된다.
 */
export const useDogamRegionDetail = (provinceCode: string | undefined) => {
  const queryClient = useQueryClient();
  const enabled = Boolean(provinceCode);

  const detailQuery = useQuery({
    enabled,
    queryFn: async (): Promise<DogamRegionDetail | null> => {
      return getMockRegionDetail(provinceCode!) ?? null;
    },
    queryKey: dogamRegionDetailKey(provinceCode ?? ""),
  });

  // 도 대표 후보 — 그 도 모든 관광지의 사진 (FR-016a).
  // 도 상세 진입마다 사진 전체를 들고 있지 않도록 별도 키로 분리했다.
  const regionPhotosQuery = useQuery({
    enabled,
    queryFn: async (): Promise<DogamPhoto[]> => {
      return getMockRegionPhotos(provinceCode!);
    },
    queryKey: dogamRegionPhotosKey(provinceCode ?? ""),
  });

  const regionPhotos = useMemo(
    () => regionPhotosQuery.data ?? [],
    [regionPhotosQuery.data],
  );

  const photoById = useMemo(() => {
    return Object.fromEntries(regionPhotos.map((photo) => [photo.photoId, photo]));
  }, [regionPhotos]);

  /**
   * 도(1depth) 대표 지정. 후보는 그 도 모든 관광지의 사진이다 (FR-016a).
   * 관광지 대표들은 건드리지 않는다 (I6).
   */
  const setRegionRepresentative = useCallback(
    (photoId: string) => {
      if (!provinceCode) {
        return;
      }

      const photoIds = regionPhotos.map((photo) => photo.photoId);

      queryClient.setQueryData<DogamRegionDetail | null>(
        dogamRegionDetailKey(provinceCode),
        (current) =>
          current
            ? applyRegionRepresentative(current, photoId, photoIds)
            : current,
      );
    },
    [provinceCode, queryClient, regionPhotos],
  );

  return {
    data: detailQuery.data ?? undefined,
    regionPhotos,
    photoById,
    error: detailQuery.error ?? regionPhotosQuery.error ?? null,
    isLoading: detailQuery.isLoading || regionPhotosQuery.isLoading,
    setRegionRepresentative,
  };
};
