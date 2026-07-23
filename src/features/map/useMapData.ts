import { fetchMapData, type MapDto } from "@/lib/api/map";
import { useQuery } from "@tanstack/react-query";

export const useMapData = () => {
  const query = useQuery<MapDto, Error>({
    queryFn: ({ signal }) => fetchMapData(signal),
    queryKey: ["map"],
  });

  return {
    data: query.data,
    error: query.error ?? undefined,
    isLoading: query.isLoading,
    reload: query.refetch,
  };
};
