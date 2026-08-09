import { useQuery } from "@tanstack/react-query";

import { fetchPlaceAndScore } from "..";

/**
 * 카메라·검토·완료 세 화면이 같은 queryKey 를 공유한다.
 * 카메라에서 한 번 받아두면 나머지 두 화면은 네트워크 없이 캐시로 뜨고,
 * staleTime(_layout.tsx 의 5분)이 지나면 알아서 다시 받는다.
 */
export const usePlaceAndScore = (placeId: string | undefined) => {
  const query = useQuery({
    enabled: Boolean(placeId),
    queryFn: () => fetchPlaceAndScore(placeId!),
    queryKey: ["place-and-score", placeId],
  });

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    reload: query.refetch,
  };
};
