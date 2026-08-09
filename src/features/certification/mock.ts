import type {
  CertifyResult,
  Composition,
  SubmitVisitPayload,
  SubmitVisitResult,
} from "./types";

/** 개발 중 실패 케이스를 확인하려면 이 값을 true로 바꾼다. */
export const MOCK_SUBMIT_SHOULD_FAIL = false;

const MOCK_COMPOSITIONS: Composition[] = [
  {
    seq: 1,
    title: "장소가 선명하게 보여요",
    description: "정자가 선명하게 담겼어요",
    // 실제 참고 구도 이미지 API가 아직 없어(docs/api-spec.md에만 설계됨) 테스트용 mock 이미지를 쓴다.
    exampleImageUrl: "https://picsum.photos/id/1015/200/300",
  },
  {
    seq: 2,
    title: "추천 구도와 잘 맞아요",
    description: "바다와 정자가 함께 잘 담겼어요",
    exampleImageUrl: "https://picsum.photos/id/1015/200/300",
  },
];

export function getCompositions(_placeId: string): Composition[] {
  return MOCK_COMPOSITIONS;
}

export async function submitVisit(
  _payload: SubmitVisitPayload,
): Promise<SubmitVisitResult> {
  if (MOCK_SUBMIT_SHOULD_FAIL) {
    return { success: false };
  }
  return { success: true };
}

export function getCertifyResult(placeName: string): CertifyResult {
  return {
    awardedPoints: 15,
    region: {
      name: placeName,
      beforePercent: 70,
      afterPercent: 74,
      collected: 104,
      total: 140,
    },
  };
}
