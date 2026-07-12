import { requestJson } from "./client";

export type PlaceVisitStatus = "VISITED" | "NONE";

export type PlaceDetailDto = {
  id: string;
  regionCode: string;
  name: string;
  address: string;
  description: string | null;
  mission: string | null;
  tags: string[];
  rarityWeight: number;
  imageUrl: string | null;
  rating: number | null;
  ratingCount: number;
  myRating: number | null;
  visitStatus: PlaceVisitStatus;
  lat: number;
  lng: number;
};

export type PlaceScoringDto = {
  action: string;
  basePoints: number;
  regionWeight: number;
  rarityWeight: number;
  eventMultiplier: number;
  estimatedPoints: number;
};

export type PlaceCompositionSource = "CURATED" | "AI";

export type PlaceCompositionDto = {
  seq: number;
  title: string;
  description: string | null;
  exampleImageUrl: string | null;
  source: PlaceCompositionSource;
};

export type PlaceCertificationDto = {
  imageUrl: string | null;
  userHandle: string | null;
};

export type PlaceCertificationsDto = {
  items: PlaceCertificationDto[];
  nextCursor: string | null;
};

export const fetchPlaceDetail = (id: string, signal?: AbortSignal) => {
  return requestJson<PlaceDetailDto>(`/api/places/${id}`, signal);
};

export const fetchPlaceScoring = (id: string, signal?: AbortSignal) => {
  return requestJson<PlaceScoringDto>(`/api/scoring/places/${id}`, signal);
};

export const fetchPlaceCompositions = (id: string, signal?: AbortSignal) => {
  return requestJson<PlaceCompositionDto[]>(
    `/api/places/${id}/compositions`,
    signal,
  );
};

export const fetchPlaceCertifications = (
  id: string,
  limit = 8,
  signal?: AbortSignal,
) => {
  return requestJson<PlaceCertificationsDto>(
    `/api/places/${id}/certifications?limit=${limit}`,
    signal,
  );
};
