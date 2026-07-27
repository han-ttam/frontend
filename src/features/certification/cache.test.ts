import { getCachedPlace, setCachedPlace } from "./cache";
import type { Place, ScorePreview } from "./types";

const place: Place = {
  id: "p1",
  name: "영금정",
  address: null,
  description: null,
  mission: null,
  tags: [],
  rarityWeight: 1,
};

const score: ScorePreview = {
  action: "CERT_PHOTO",
  basePoints: 15,
  regionWeight: 1.5,
  rarityWeight: 1,
  eventMultiplier: 1,
  estimatedPoints: 22.5,
};

describe("certification cache", () => {
  it("returns undefined for a placeId that was never cached", () => {
    expect(getCachedPlace("missing-id")).toBeUndefined();
  });

  it("returns the same entry that was set", () => {
    setCachedPlace("p1", { place, score });
    expect(getCachedPlace("p1")).toEqual({ place, score });
  });
});
