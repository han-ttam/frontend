import { fetchLandingData, type LandingDto } from "@/lib/api/landing";
import { useQuery } from "@tanstack/react-query";

export const useLandingData = (enabled = true) => {
  const query = useQuery<LandingDto, Error>({
    enabled,
    queryFn: ({ signal }) => fetchLandingData(signal),
    queryKey: ["landing"],
  });

  return {
    data: query.data,
    error: query.error ?? undefined,
    isLoading: enabled ? query.isLoading : false,
    reload: query.refetch,
  };
};
