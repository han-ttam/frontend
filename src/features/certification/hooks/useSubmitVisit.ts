import { useCallback, useState } from "react";
import { submitVisit } from "../index";
import type { SubmitVisitPayload } from "../types";

export function useSubmitVisit() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (payload: SubmitVisitPayload) => {
    setSubmitting(true);
    setError(null);
    const result = await submitVisit(payload);
    setSubmitting(false);
    if (!result.success) {
      setError("인증 제출에 실패했어요. 다시 시도해주세요.");
    }
    return result.success;
  }, []);

  return { submit, submitting, error };
}
