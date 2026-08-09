import { computeDistance, opportunityScore, rankNearbyPlaces } from "./ranking";
import type { NearbyPlace } from "./types";

function place(overrides: Partial<NearbyPlace>): NearbyPlace {
  return {
    id: "p",
    name: "테스트 장소",
    rarityWeight: 1,
    distanceMeters: 0,
    ...overrides,
  };
}

describe("opportunityScore", () => {
  it("returns 0 when distance equals the radius", () => {
    expect(opportunityScore(place({ rarityWeight: 2.5, distanceMeters: 2000 }), 2000)).toBe(0);
  });

  it("returns rarityWeight when distance is 0", () => {
    expect(opportunityScore(place({ rarityWeight: 2.5, distanceMeters: 0 }), 2000)).toBe(2.5);
  });

  it("returns 0 when rarityWeight is 0 regardless of distance", () => {
    expect(opportunityScore(place({ rarityWeight: 0, distanceMeters: 100 }), 2000)).toBe(0);
  });

  it("scores a general case between 0 and rarityWeight", () => {
    const score = opportunityScore(place({ rarityWeight: 2, distanceMeters: 1000 }), 2000);
    expect(score).toBeCloseTo(1, 5);
  });
});

describe("computeDistance", () => {
  it("returns 0 for identical coordinates", () => {
    expect(computeDistance({ lat: 38.2, lng: 128.5 }, { lat: 38.2, lng: 128.5 })).toBe(0);
  });

  it("returns a positive distance for different coordinates", () => {
    expect(computeDistance({ lat: 38.2, lng: 128.5 }, { lat: 38.21, lng: 128.51 })).toBeGreaterThan(0);
  });
});

describe("rankNearbyPlaces", () => {
  it("sorts by opportunityScore descending", () => {
    const places = [
      place({ id: "low", rarityWeight: 1, distanceMeters: 1900 }),
      place({ id: "high", rarityWeight: 3, distanceMeters: 200 }),
    ];

    const ranked = rankNearbyPlaces(places, 2000);

    expect(ranked.map((p) => p.id)).toEqual(["high", "low"]);
  });

  it("breaks ties by distance ascending", () => {
    // tied-far: 1 * (1 - 1000/2000) = 0.5 ; tied-near: 2 * (1 - 1500/2000) = 0.5 -> same score
    const tied = [
      place({ id: "tied-far", rarityWeight: 1, distanceMeters: 1000 }),
      place({ id: "tied-near", rarityWeight: 2, distanceMeters: 1500 }),
    ];

    const ranked = rankNearbyPlaces(tied, 2000);

    expect(ranked.map((p) => p.id)).toEqual(["tied-far", "tied-near"]);
  });
});
