import {
  fetchCurrentAgreement,
  type AgreementDto,
  type AgreementType,
} from "@/lib/api/agreements";
import { useQuery } from "@tanstack/react-query";

export const useAgreement = (type?: AgreementType) => {
  const query = useQuery<AgreementDto, Error>({
    enabled: type !== undefined,
    queryFn: ({ signal }) => fetchCurrentAgreement(type!, signal),
    queryKey: ["agreement", type],
  });

  return {
    data: query.data,
    error: query.error ?? undefined,
    isLoading: query.isLoading,
  };
};
