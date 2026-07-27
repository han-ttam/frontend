import { computeDestinationPoint } from "geolib";

import type {
  CertifyResult,
  Composition,
  NearbyPlace,
  NearbyPlacesQuery,
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

interface NearbyTemplate {
  id: string;
  name: string;
  rarityWeight: number;
  distanceMeters: number;
  bearing: number;
}

/**
 * `GET /places/nearby`가 아직 없어(docs/api-spec.md에만 설계됨) 실제 배포된 백엔드의 진짜
 * 장소 id/name을 가져다 mock 응답을 만든다 — 카드를 탭해서 camera.tsx로 넘어가면 실제
 * GET /api/places/:id 조회가 성공한다. 좌표는 질의한 위치 기준 상대 오프셋으로 합성해 어디서
 * 테스트하든 "근처"처럼 보이게 한다. rarityWeight는 현재 배포된 백엔드가 전부 1로 시딩돼 있어
 * 히어로 카드의 "희소 장소" 배지를 보여주기 위한 데모용 값으로 일부만 올려뒀다 — 실제
 * /places/nearby가 배포되면 진짜 rarityWeight로 교체된다.
 */
const MOCK_NEARBY_TEMPLATES: NearbyTemplate[] = [
  { id: "019f383f-76bb-756c-b583-242a3604600b", name: "KT&G 상상마당 춘천", rarityWeight: 2.5, distanceMeters: 380, bearing: 45 },
  { id: "019f383f-76ac-718e-b9b8-19d779ecf6da", name: "DMZ펀치볼둘레길", rarityWeight: 1.2, distanceMeters: 650, bearing: 120 },
  { id: "019f383f-76ab-73fa-8f76-37513588953f", name: "DMZ 생태평화공원", rarityWeight: 1, distanceMeters: 900, bearing: 200 },
  { id: "019f383f-7699-727a-857a-4b1c0bf51834", name: "643고지전투전적비", rarityWeight: 1.5, distanceMeters: 1400, bearing: 280 },
  { id: "019f383f-76df-73de-9b25-ba1c03bad51a", name: "故박정렬여사 추모공원", rarityWeight: 1, distanceMeters: 1850, bearing: 320 },
];

export async function getNearbyPlaces(query: NearbyPlacesQuery): Promise<NearbyPlace[]> {
  return MOCK_NEARBY_TEMPLATES.filter((t) => t.distanceMeters <= query.radius)
    .slice(0, query.limit)
    .map((t) => {
      const dest = computeDestinationPoint({ latitude: query.lat, longitude: query.lng }, t.distanceMeters, t.bearing);
      return {
        id: t.id,
        name: t.name,
        rarityWeight: t.rarityWeight,
        lat: dest.latitude,
        lng: dest.longitude,
        distanceMeters: t.distanceMeters,
      };
    });
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
