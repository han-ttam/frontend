import {
  applyPlaceRepresentative,
  applyPlaceRepresentativeToRegion,
  applyRegionRepresentative,
} from "@/features/collection/representative";
import type {
  DogamPhoto,
  DogamPlace,
  DogamPlacePhotos,
  DogamRegionDetail,
} from "@/features/collection/types";

const photo = (photoId: string, placeId: string): DogamPhoto => ({
  photoId,
  placeId,
  placeName: placeId,
  imageUrl: `https://example.test/${photoId}.jpg`,
  verifiedAt: "2026-07-19T00:00:00.000Z",
});

const place = (
  placeId: string,
  representativePhotoId: string | null,
): DogamPlace => ({
  placeId,
  provinceCode: "32",
  name: placeId,
  address: "주소",
  photoCount: 3,
  lastVerifiedAt: "2026-07-19T00:00:00.000Z",
  representativePhotoId,
});

const placePhotos = (): DogamPlacePhotos => ({
  place: place("yeonggeumjeong", "yeonggeumjeong-p1"),
  photos: [
    photo("yeonggeumjeong-p1", "yeonggeumjeong"),
    photo("yeonggeumjeong-p2", "yeonggeumjeong"),
    photo("yeonggeumjeong-p3", "yeonggeumjeong"),
  ],
});

const regionDetail = (): DogamRegionDetail => ({
  region: {
    provinceCode: "32",
    name: "강원도",
    percent: 74,
    collected: 15,
    total: 21,
    locked: false,
    representativePhotoId: "yeonggeumjeong-p1",
  },
  places: [
    place("yeonggeumjeong", "yeonggeumjeong-p1"),
    place("seoraksan", "seoraksan-p1"),
  ],
  photoTotal: 41,
});

const REGION_PHOTO_IDS = [
  "yeonggeumjeong-p1",
  "yeonggeumjeong-p2",
  "yeonggeumjeong-p3",
  "seoraksan-p1",
  "seoraksan-p2",
];

describe("applyPlaceRepresentative (관광지 2depth)", () => {
  it("그 관광지 사진으로 대표를 바꾼다", () => {
    const next = applyPlaceRepresentative(placePhotos(), "yeonggeumjeong-p3");

    expect(next.place.representativePhotoId).toBe("yeonggeumjeong-p3");
  });

  it("이미 대표인 사진이면 입력을 그대로 돌려준다", () => {
    const current = placePhotos();

    expect(applyPlaceRepresentative(current, "yeonggeumjeong-p1")).toBe(current);
  });

  it("그 관광지에 없는 사진은 무시한다 (불변식 I1)", () => {
    const current = placePhotos();

    // seoraksan 사진은 yeonggeumjeong 의 대표가 될 수 없다.
    expect(applyPlaceRepresentative(current, "seoraksan-p1")).toBe(current);
  });

  it("입력을 변형하지 않는다", () => {
    const current = placePhotos();

    applyPlaceRepresentative(current, "yeonggeumjeong-p2");

    expect(current.place.representativePhotoId).toBe("yeonggeumjeong-p1");
  });
});

describe("applyPlaceRepresentativeToRegion (FR-012 표지 갱신)", () => {
  it("도 상세의 해당 관광지 표지를 갱신한다", () => {
    const next = applyPlaceRepresentativeToRegion(
      regionDetail(),
      "yeonggeumjeong",
      "yeonggeumjeong-p2",
    );

    expect(next.places[0].representativePhotoId).toBe("yeonggeumjeong-p2");
  });

  it("다른 관광지는 건드리지 않는다", () => {
    const next = applyPlaceRepresentativeToRegion(
      regionDetail(),
      "yeonggeumjeong",
      "yeonggeumjeong-p2",
    );

    expect(next.places[1].representativePhotoId).toBe("seoraksan-p1");
  });

  it("도 대표는 그대로 유지한다 (불변식 I6)", () => {
    const next = applyPlaceRepresentativeToRegion(
      regionDetail(),
      "yeonggeumjeong",
      "yeonggeumjeong-p2",
    );

    expect(next.region.representativePhotoId).toBe("yeonggeumjeong-p1");
  });

  it("없는 관광지면 입력을 그대로 돌려준다", () => {
    const current = regionDetail();

    expect(
      applyPlaceRepresentativeToRegion(current, "unknown", "x-p1"),
    ).toBe(current);
  });
});

describe("applyRegionRepresentative (도 1depth)", () => {
  it("그 도 어느 관광지의 사진이든 대표가 될 수 있다 (불변식 I2)", () => {
    const next = applyRegionRepresentative(
      regionDetail(),
      "seoraksan-p2",
      REGION_PHOTO_IDS,
    );

    expect(next.region.representativePhotoId).toBe("seoraksan-p2");
  });

  it("관광지 대표들은 건드리지 않는다 (불변식 I6)", () => {
    const next = applyRegionRepresentative(
      regionDetail(),
      "seoraksan-p2",
      REGION_PHOTO_IDS,
    );

    expect(next.places.map((p) => p.representativePhotoId)).toEqual([
      "yeonggeumjeong-p1",
      "seoraksan-p1",
    ]);
  });

  it("이미 대표인 사진이면 입력을 그대로 돌려준다", () => {
    const current = regionDetail();

    expect(
      applyRegionRepresentative(current, "yeonggeumjeong-p1", REGION_PHOTO_IDS),
    ).toBe(current);
  });

  it("그 도에 없는 사진은 무시한다", () => {
    const current = regionDetail();

    expect(
      applyRegionRepresentative(current, "jeju-p1", REGION_PHOTO_IDS),
    ).toBe(current);
  });

  it("입력을 변형하지 않는다", () => {
    const current = regionDetail();

    applyRegionRepresentative(current, "seoraksan-p1", REGION_PHOTO_IDS);

    expect(current.region.representativePhotoId).toBe("yeonggeumjeong-p1");
  });
});
