import { request, requestJson } from "./client";

export type AgreementType = "TOS" | "PRIVACY";

export type AgreementDto = {
  id: string;
  type: AgreementType;
  title: string;
  body: string;
};

export const agreementLabels: Record<AgreementType, string> = {
  TOS: "서비스 이용약관",
  PRIVACY: "개인정보 처리방침",
};

export const fetchCurrentAgreement = (
  type: AgreementType,
  signal?: AbortSignal,
) => {
  return requestJson<AgreementDto>(
    `/api/agreements/current?type=${type}`,
    signal,
  );
};

export const acceptAgreement = (
  agreementId: string,
  accessToken: string,
  signal?: AbortSignal,
) => {
  return request<void>("/api/me/agreements", {
    method: "POST",
    body: { agreementId },
    accessToken,
    signal,
  });
};
