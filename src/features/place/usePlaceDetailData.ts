import {
  fetchPlaceCertifications,
  fetchPlaceCompositions,
  fetchPlaceDetail,
  fetchPlaceScoring,
  type PlaceCertificationsDto,
  type PlaceCompositionDto,
  type PlaceDetailDto,
  type PlaceScoringDto,
} from "@/lib/api/placeDetail";
import { useQuery } from "@tanstack/react-query";

const CERTIFICATION_PAGE_SIZE = 8;

export type PlaceDetailData = {
  place: PlaceDetailDto;
  scoring: PlaceScoringDto | undefined;
  compositions: PlaceCompositionDto[];
  certifications: PlaceCertificationsDto;
};

const emptyCertifications: PlaceCertificationsDto = {
  items: [],
  nextCursor: null,
};

/**
 * 장소 상세는 /places/{id} 하나만 필수다.
 * 점수·구도·인증샷은 실패해도 각 섹션만 비고 화면은 그대로 뜬다.
 */
export const usePlaceDetailData = (id: string | undefined) => {
  const enabled = Boolean(id);

  const placeQuery = useQuery({
    enabled,
    queryFn: ({ signal }) => fetchPlaceDetail(id!, signal),
    queryKey: ["place-detail", id],
  });

  const scoringQuery = useQuery({
    enabled,
    queryFn: ({ signal }) => fetchPlaceScoring(id!, signal),
    queryKey: ["place-scoring", id],
  });

  const compositionsQuery = useQuery({
    enabled,
    queryFn: ({ signal }) => fetchPlaceCompositions(id!, signal),
    queryKey: ["place-compositions", id],
  });

  const certificationsQuery = useQuery({
    enabled,
    queryFn: ({ signal }) =>
      fetchPlaceCertifications(id!, CERTIFICATION_PAGE_SIZE, signal),
    queryKey: ["place-certifications", id],
  });

  const data: PlaceDetailData | undefined = placeQuery.data
    ? {
        place: placeQuery.data,
        scoring: scoringQuery.data,
        compositions: compositionsQuery.data ?? [],
        certifications: certificationsQuery.data ?? emptyCertifications,
      }
    : undefined;

  return {
    data,
    error: placeQuery.error ?? null,
    isLoading: placeQuery.isLoading,
    reload: () => {
      placeQuery.refetch();
      scoringQuery.refetch();
      compositionsQuery.refetch();
      certificationsQuery.refetch();
    },
  };
};
