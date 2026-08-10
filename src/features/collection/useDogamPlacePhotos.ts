import {
  applyPlaceRepresentative,
  applyPlaceRepresentativeToRegion,
} from "@/features/collection/representative";
import type {
  DogamPlacePhotos,
  DogamRegionDetail,
} from "@/features/collection/types";
import { dogamRegionDetailKey } from "@/features/collection/useDogamRegionDetail";
import {
  fetchPlacePhotos,
  setPlaceRepresentativePhoto,
} from "@/lib/api/dogamPhotos";
import { fetchPlaceDetail } from "@/lib/api/placeDetail";
import { useAuth } from "@/stores/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export const dogamPlacePhotosKey = (placeId: string) => {
  return ["dogam-place-photos", placeId] as const;
};

/**
 * 장소 상세의 regionCode 는 "1_23" 같은 복합 코드인데, 도감은 시·도 코드("1")를
 * 쓴다. 앞부분만 떼어 맞춘다.
 */
const toProvinceCode = (regionCode: string) => regionCode.split("_")[0] ?? "";

export const useDogamPlacePhotos = (placeId: string | undefined) => {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const enabled = Boolean(placeId) && isAuthenticated && Boolean(accessToken);

  const photosQuery = useQuery({
    enabled,
    queryFn: async ({ signal }): Promise<DogamPlacePhotos | null> => {
      const [photos, place] = await Promise.all([
        fetchPlacePhotos(placeId!, accessToken!, signal),
        // 사진 응답에는 장소 이름·주소가 없을 수 있어 장소 상세로 채운다.
        fetchPlaceDetail(placeId!, signal),
      ]);

      const lastVerifiedAt = photos
        .map((photo) => photo.verifiedAt)
        .sort()
        .at(-1);

      return {
        place: {
          placeId: placeId!,
          provinceCode: toProvinceCode(place.regionCode),
          name: place.name,
          address: place.address,
          photoCount: photos.length,
          lastVerifiedAt: lastVerifiedAt ?? "",
          representativePhotoId: null,
        },
        photos,
      };
    },
    queryKey: dogamPlacePhotosKey(placeId ?? ""),
  });

  const data = photosQuery.data ?? undefined;

  const representativeMutation = useMutation({
    mutationFn: (photoId: string) =>
      setPlaceRepresentativePhoto(placeId!, photoId, accessToken!),
    onError: (_error, _photoId, context) => {
      if (context?.previousPhotos !== undefined) {
        queryClient.setQueryData(
          dogamPlacePhotosKey(placeId!),
          context.previousPhotos,
        );
      }

      if (context?.provinceCode && context.previousRegion !== undefined) {
        queryClient.setQueryData(
          dogamRegionDetailKey(context.provinceCode),
          context.previousRegion,
        );
      }
    },
    onMutate: async (photoId: string) => {
      const photosKey = dogamPlacePhotosKey(placeId!);

      await queryClient.cancelQueries({ queryKey: photosKey });

      const previousPhotos =
        queryClient.getQueryData<DogamPlacePhotos | null>(photosKey);
      const provinceCode = previousPhotos?.place.provinceCode;
      const previousRegion = provinceCode
        ? queryClient.getQueryData<DogamRegionDetail | null>(
            dogamRegionDetailKey(provinceCode),
          )
        : undefined;

      queryClient.setQueryData<DogamPlacePhotos | null>(photosKey, (current) =>
        current ? applyPlaceRepresentative(current, photoId) : current,
      );

      // 도 상세를 아직 보지 않았다면 캐시가 없다. 그 경우 갱신할 것도 없다.
      if (provinceCode) {
        queryClient.setQueryData<DogamRegionDetail | null>(
          dogamRegionDetailKey(provinceCode),
          (current) =>
            current
              ? applyPlaceRepresentativeToRegion(current, placeId!, photoId)
              : current,
        );
      }

      return { previousPhotos, previousRegion, provinceCode };
    },
  });

  const setPlaceRepresentative = useCallback(
    (photoId: string) => {
      if (!placeId || !accessToken || !data) {
        return;
      }

      // 변경이 없으면(이미 대표거나 후보 밖) 서버를 부르지 않는다.
      if (applyPlaceRepresentative(data, photoId) === data) {
        return;
      }

      representativeMutation.mutate(photoId);
    },
    [accessToken, data, placeId, representativeMutation],
  );

  return {
    data,
    error: photosQuery.error ?? null,
    isLoading: photosQuery.isLoading,
    representativeError: representativeMutation.error ?? null,
    setPlaceRepresentative,
  };
};
