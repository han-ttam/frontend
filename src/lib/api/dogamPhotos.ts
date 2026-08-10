import type { DogamPhoto } from "@/features/collection/types";

import { request } from "./client";

/**
 * 도감 사진첩 · 대표사진 지정.
 *
 * **응답 형태를 확인하지 못했다.** 계정에 인증 사진이 0장이라 배열이 비어
 * 항목을 볼 수 없었고, 사진을 만들려면 실제로 여행지에서 카메라·GPS 인증을
 * 해야 한다.
 *
 * 그래서 필드를 하나씩 검증해 담는다. 형태가 예상과 다르면 화면이 깨지는 대신
 * 그 사진만 빠진다. 사진이 생기면 실응답으로 한 번 맞춰봐야 한다.
 */

const asString = (value: unknown) =>
  typeof value === "string" ? value : undefined;

const toItemArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  const items = (value as { items?: unknown })?.items;

  return Array.isArray(items) ? items : [];
};

const toPhoto = (value: unknown): DogamPhoto | undefined => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const item = value as Record<string, unknown>;
  const photoId = asString(item.photoId) ?? asString(item.id);
  const imageUrl = asString(item.imageUrl) ?? asString(item.url);

  if (!photoId || !imageUrl) {
    return undefined;
  }

  return {
    photoId,
    placeId: asString(item.placeId) ?? "",
    placeName: asString(item.placeName) ?? asString(item.name) ?? "",
    imageUrl,
    verifiedAt: asString(item.verifiedAt) ?? asString(item.createdAt) ?? "",
  };
};

const toPhotos = (value: unknown) =>
  toItemArray(value)
    .map(toPhoto)
    .filter((item): item is DogamPhoto => item !== undefined);

/** 그 시·도 안 모든 관광지의 내 사진 — 도 대표 후보다. */
export const fetchRegionPhotos = async (
  provinceCode: string,
  accessToken: string,
  signal?: AbortSignal,
): Promise<DogamPhoto[]> => {
  const result = await request<unknown>(
    `/api/me/regions/${provinceCode}/photos`,
    { accessToken, signal },
  );

  return toPhotos(result);
};

/** 그 관광지의 내 사진 — 관광지 대표 후보다. */
export const fetchPlacePhotos = async (
  placeId: string,
  accessToken: string,
  signal?: AbortSignal,
): Promise<DogamPhoto[]> => {
  const result = await request<unknown>(`/api/me/places/${placeId}/photos`, {
    accessToken,
    signal,
  });

  return toPhotos(result);
};

/**
 * 대표사진 지정·해제.
 * 응답 본문은 쓰지 않는다. 2xx 인데 본문이 예상과 다르면(빈 본문 포함) 쓰기는
 * 이미 일어난 것이므로 성공으로 본다 — 찜 추가·해제와 같은 규칙이다.
 */
const writeRepresentative = async (
  path: string,
  method: "PUT" | "DELETE",
  accessToken: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<void> => {
  try {
    await request<unknown>(path, { method, body, accessToken, signal });
  } catch (error) {
    const isUnexpectedBody =
      error instanceof SyntaxError ||
      (error instanceof Error &&
        "code" in error &&
        (error as { code?: string }).code === "INVALID_RESPONSE");

    if (!isUnexpectedBody) {
      throw error;
    }
  }
};

export const setPlaceRepresentativePhoto = (
  placeId: string,
  photoId: string,
  accessToken: string,
  signal?: AbortSignal,
) =>
  writeRepresentative(
    `/api/me/places/${placeId}/representative`,
    "PUT",
    accessToken,
    { photoId },
    signal,
  );

export const clearPlaceRepresentativePhoto = (
  placeId: string,
  accessToken: string,
  signal?: AbortSignal,
) =>
  writeRepresentative(
    `/api/me/places/${placeId}/representative`,
    "DELETE",
    accessToken,
    undefined,
    signal,
  );

export const setRegionRepresentativePhoto = (
  provinceCode: string,
  photoId: string,
  accessToken: string,
  signal?: AbortSignal,
) =>
  writeRepresentative(
    `/api/me/regions/${provinceCode}/representative`,
    "PUT",
    accessToken,
    { photoId },
    signal,
  );

export const clearRegionRepresentativePhoto = (
  provinceCode: string,
  accessToken: string,
  signal?: AbortSignal,
) =>
  writeRepresentative(
    `/api/me/regions/${provinceCode}/representative`,
    "DELETE",
    accessToken,
    undefined,
    signal,
  );
