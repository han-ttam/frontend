import { applyRegionRepresentative } from "@/features/collection/representative";
import type {
  DogamPhoto,
  DogamPlace,
  DogamRegion,
  DogamRegionDetail,
} from "@/features/collection/types";
import { fetchDogamRegions } from "@/lib/api/dogam";
import {
  fetchRegionPhotos,
  setRegionRepresentativePhoto,
} from "@/lib/api/dogamPhotos";
import { useAuth } from "@/stores/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

export const dogamRegionDetailKey = (provinceCode: string) => {
  return ["dogam-region-detail", provinceCode] as const;
};

export const dogamRegionPhotosKey = (provinceCode: string) => {
  return ["dogam-region-photos", provinceCode] as const;
};

/**
 * 서버에는 "이 시·도에서 내가 수집한 관광지 목록" 엔드포인트가 없다.
 * 대신 그 시·도의 내 사진이 사진마다 placeId·placeName 을 들고 오므로,
 * 장소별로 묶어 카드를 만든다. 도감은 원래 내가 인증한 것만 보여주는
 * 화면이라 이 모델이 맞다.
 */
const toPlaces = (photos: DogamPhoto[]): DogamPlace[] => {
  const byPlace = new Map<string, DogamPhoto[]>();

  photos.forEach((photo) => {
    const current = byPlace.get(photo.placeId) ?? [];

    current.push(photo);
    byPlace.set(photo.placeId, current);
  });

  return Array.from(byPlace.entries()).map(([placeId, placePhotos]) => {
    const lastVerifiedAt = placePhotos
      .map((photo) => photo.verifiedAt)
      .sort()
      .at(-1);

    return {
      placeId,
      provinceCode: "",
      name: placePhotos[0]?.placeName ?? "",
      // 사진 응답에 주소가 없다. 카드에서 주소 줄은 비워둔다.
      address: "",
      photoCount: placePhotos.length,
      lastVerifiedAt: lastVerifiedAt ?? "",
      representativePhotoId: null,
    };
  });
};

export const useDogamRegionDetail = (provinceCode: string | undefined) => {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const enabled =
    Boolean(provinceCode) && isAuthenticated && Boolean(accessToken);

  const regionsQuery = useQuery({
    enabled,
    queryFn: ({ signal }) => fetchDogamRegions(accessToken!, signal),
    queryKey: ["dogam-regions"],
  });

  const regionPhotosQuery = useQuery({
    enabled,
    queryFn: ({ signal }) =>
      fetchRegionPhotos(provinceCode!, accessToken!, signal),
    queryKey: dogamRegionPhotosKey(provinceCode ?? ""),
  });

  const regionPhotos = useMemo(
    () => regionPhotosQuery.data ?? [],
    [regionPhotosQuery.data],
  );

  const region: DogamRegion | undefined = useMemo(
    () =>
      regionsQuery.data?.find((item) => item.provinceCode === provinceCode),
    [provinceCode, regionsQuery.data],
  );

  // 대표 지정은 캐시를 상태 저장소로 쓴다. 화면을 오가도 유지되도록.
  const detailQuery = useQuery({
    enabled: enabled && Boolean(region),
    queryFn: async (): Promise<DogamRegionDetail | null> => {
      if (!region) {
        return null;
      }

      const places = toPlaces(regionPhotos).map((place) => ({
        ...place,
        provinceCode: region.provinceCode,
      }));

      return {
        region,
        places,
        photoTotal: places.reduce((sum, place) => sum + place.photoCount, 0),
      };
    },
    queryKey: dogamRegionDetailKey(provinceCode ?? ""),
  });

  const photoById = useMemo(() => {
    return Object.fromEntries(
      regionPhotos.map((photo) => [photo.photoId, photo]),
    );
  }, [regionPhotos]);

  const representativeMutation = useMutation({
    mutationFn: (photoId: string) =>
      setRegionRepresentativePhoto(provinceCode!, photoId, accessToken!),
    onError: (_error, _photoId, context) => {
      // 서버 저장이 실패하면 낙관적 변경을 되돌린다.
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          dogamRegionDetailKey(provinceCode!),
          context.previous,
        );
      }
    },
    onMutate: async (photoId: string) => {
      const key = dogamRegionDetailKey(provinceCode!);

      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<DogamRegionDetail | null>(key);
      const photoIds = regionPhotos.map((photo) => photo.photoId);

      queryClient.setQueryData<DogamRegionDetail | null>(key, (current) =>
        current ? applyRegionRepresentative(current, photoId, photoIds) : current,
      );

      return { previous };
    },
  });

  const setRegionRepresentative = useCallback(
    (photoId: string) => {
      if (!provinceCode || !accessToken) {
        return;
      }

      representativeMutation.mutate(photoId);
    },
    [accessToken, provinceCode, representativeMutation],
  );

  return {
    data: detailQuery.data ?? undefined,
    regionPhotos,
    photoById,
    error: regionsQuery.error ?? regionPhotosQuery.error ?? null,
    isLoading: regionsQuery.isLoading || regionPhotosQuery.isLoading,
    representativeError: representativeMutation.error ?? null,
    setRegionRepresentative,
  };
};
