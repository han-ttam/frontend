import { fetchCollectionDetail } from "@/lib/api/collectionDetail";
import { useQuery } from "@tanstack/react-query";

/**
 * 모음 상세(명소 목록) 조회 — GET /api/collections/{id}.
 *
 * 공개 엔드포인트라 로그인 없이도 열린다. 다만 진입점인
 * `/api/me/collections` 가 2026-08-09 현재 500 이라 실제로 여기 도달할
 * 방법이 없다. 서버가 고쳐지면 응답 형태를 한 번 맞춰봐야 한다.
 */
export const useCollectionDetailData = (id: string | undefined) => {
  const collectionQuery = useQuery({
    enabled: Boolean(id),
    queryFn: ({ signal }) => fetchCollectionDetail(id!, signal),
    queryKey: ["mypage-collection-detail", id],
  });

  return {
    data: collectionQuery.data,
    error: collectionQuery.error ?? null,
    isLoading: collectionQuery.isLoading,
    reload: () => {
      collectionQuery.refetch();
    },
  };
};
