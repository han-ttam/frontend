import { getNearbyPlaces } from "./mock";

describe("getNearbyPlaces (mock)", () => {
  const baseQuery = { lat: 38.207, lng: 128.594, radius: 2000, limit: 20 };

  it("returns places within radius with lat/lng/distanceMeters populated", async () => {
    const result = await getNearbyPlaces(baseQuery);

    expect(result.length).toBeGreaterThan(0);
    for (const place of result) {
      expect(place.distanceMeters).toBeLessThanOrEqual(baseQuery.radius);
      expect(typeof place.lat).toBe("number");
      expect(typeof place.lng).toBe("number");
    }
  });

  it("returns an empty array when radius excludes all mock places", async () => {
    const result = await getNearbyPlaces({ ...baseQuery, radius: 100 });

    expect(result).toEqual([]);
  });

  it("respects the limit parameter", async () => {
    const result = await getNearbyPlaces({ ...baseQuery, limit: 2 });

    expect(result.length).toBeLessThanOrEqual(2);
  });
});
