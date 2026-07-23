import { sortPlaces } from "@/features/collection/sortPlaces";
import type { DogamPlace } from "@/features/collection/types";

const place = (
  placeId: string,
  photoCount: number,
  lastVerifiedAt: string,
  name = placeId,
): DogamPlace => ({
  placeId,
  provinceCode: "32",
  name,
  address: "주소",
  photoCount,
  lastVerifiedAt,
  representativePhotoId: `${placeId}-p1`,
});

describe("sortPlaces", () => {
  describe("전체 (all)", () => {
    it("서버가 준 기본 순서를 그대로 유지한다", () => {
      const places = [
        place("c", 1, "2026-01-01T00:00:00.000Z"),
        place("a", 9, "2026-07-01T00:00:00.000Z"),
        place("b", 5, "2026-04-01T00:00:00.000Z"),
      ];

      expect(sortPlaces(places, "all").map((p) => p.placeId)).toEqual([
        "c",
        "a",
        "b",
      ]);
    });
  });

  describe("최근순 (recent)", () => {
    it("lastVerifiedAt 내림차순으로 정렬한다", () => {
      const places = [
        place("old", 1, "2026-01-01T00:00:00.000Z"),
        place("new", 1, "2026-07-01T00:00:00.000Z"),
        place("mid", 1, "2026-04-01T00:00:00.000Z"),
      ];

      expect(sortPlaces(places, "recent").map((p) => p.placeId)).toEqual([
        "new",
        "mid",
        "old",
      ]);
    });

    it("같은 시각이면 이름 오름차순으로 가른다", () => {
      const at = "2026-07-01T00:00:00.000Z";
      const places = [
        place("p3", 1, at, "다랭이마을"),
        place("p1", 1, at, "가평역"),
        place("p2", 1, at, "나리분지"),
      ];

      expect(sortPlaces(places, "recent").map((p) => p.name)).toEqual([
        "가평역",
        "나리분지",
        "다랭이마을",
      ]);
    });
  });

  describe("사진 많은순 (mostPhotos)", () => {
    it("photoCount 내림차순으로 정렬한다", () => {
      const places = [
        place("few", 1, "2026-01-01T00:00:00.000Z"),
        place("many", 9, "2026-01-01T00:00:00.000Z"),
        place("some", 4, "2026-01-01T00:00:00.000Z"),
      ];

      expect(sortPlaces(places, "mostPhotos").map((p) => p.placeId)).toEqual([
        "many",
        "some",
        "few",
      ]);
    });

    it("같은 장수면 lastVerifiedAt 내림차순으로 가른다", () => {
      const places = [
        place("old", 3, "2026-01-01T00:00:00.000Z"),
        place("new", 3, "2026-07-01T00:00:00.000Z"),
        place("mid", 3, "2026-04-01T00:00:00.000Z"),
      ];

      expect(sortPlaces(places, "mostPhotos").map((p) => p.placeId)).toEqual([
        "new",
        "mid",
        "old",
      ]);
    });
  });

  describe("비파괴", () => {
    it("입력 배열을 변형하지 않는다", () => {
      const places = [
        place("a", 1, "2026-01-01T00:00:00.000Z"),
        place("b", 9, "2026-07-01T00:00:00.000Z"),
      ];
      const before = places.map((p) => p.placeId);

      sortPlaces(places, "mostPhotos");
      sortPlaces(places, "recent");

      expect(places.map((p) => p.placeId)).toEqual(before);
    });

    it("새 배열을 돌려준다", () => {
      const places = [place("a", 1, "2026-01-01T00:00:00.000Z")];

      expect(sortPlaces(places, "all")).not.toBe(places);
    });
  });

  it("빈 배열도 처리한다", () => {
    expect(sortPlaces([], "recent")).toEqual([]);
  });
});
