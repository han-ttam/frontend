export interface Place {
  id: string;
  name: string;
  address: string | null;
  description: string | null;
  mission: string | null;
  tags: string[];
  rarityWeight: number;
}

export interface ScorePreview {
  action: string;
  basePoints: number;
  regionWeight: number;
  rarityWeight: number;
  eventMultiplier: number;
  estimatedPoints: number;
}

export interface Composition {
  seq: number;
  title: string;
  description: string;
  exampleImageUrl: string;
}

export type Visibility = "PRIVATE" | "PUBLIC";

export interface SubmitVisitPayload {
  placeId: string;
  caption?: string;
  visibility: Visibility;
}

export interface SubmitVisitResult {
  success: boolean;
}

export interface CertifyResult {
  awardedPoints: number;
  region: {
    name: string;
    beforePercent: number;
    afterPercent: number;
    collected: number;
    total: number;
  };
}

/** 근처 장소 목록 카드에 필요한 최소 필드만 가진 독립 타입 — Place를 확장하지 않아 리스트/상세 API가 결합되지 않는다. */
export interface NearbyPlace {
  id: string;
  name: string;
  rarityWeight: number;
  distanceMeters: number;
}

export interface NearbyPlacesQuery {
  lat: number;
  lng: number;
  radius: number;
  limit: number;
}
