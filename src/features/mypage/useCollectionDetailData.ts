import { resolveCollectionDetailMock } from "@/features/mypage/collectionDetailMock";
import { useQuery } from "@tanstack/react-query";

/**
 * 모음 상세(명소 목록) 조회.
 *
 * 지금은 queryFn 이 목데이터를 돌려준다. 앱 키가 나오면
 * `fetchCollectionDetail(id, signal)` 로 이 한 줄만 바꾸면 연동이 끝난다.
 * (specs/002-mypage-collection-places/contracts/api-future.md)
 */
export const useCollectionDetailData = (id: string | undefined) => {
  const collectionQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => resolveCollectionDetailMock(id!),
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
