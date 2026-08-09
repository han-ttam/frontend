import {
  DEFAULT_MISSION,
  formatPoints,
  formatRating,
  formatTag,
  formatWeight,
  getMissionText,
  RATING_EMPTY,
} from "../format";

describe("place detail formatting", () => {
  it("keeps weights short and only shows decimals when they exist", () => {
    expect(formatWeight(1)).toBe("×1");
    expect(formatWeight(1.5)).toBe("×1.5");
    expect(formatWeight(1.25)).toBe("×1.25");
  });

  it("shows a dash instead of a rating when nobody rated the place", () => {
    expect(formatRating(null, 0)).toBe(RATING_EMPTY);
    expect(formatRating(4.8, 0)).toBe(RATING_EMPTY);
    expect(formatRating(4.75, 12)).toBe("4.8");
  });

  it("drops trailing zeros from the estimated points", () => {
    expect(formatPoints(15)).toBe("15");
    expect(formatPoints(22.5)).toBe("22.5");
  });

  it("prefixes tags with a hash exactly once", () => {
    expect(formatTag("동해바다")).toBe("#동해바다");
    expect(formatTag("#정자")).toBe("#정자");
  });

  it("falls back to the default mission when the server has none", () => {
    expect(getMissionText(null)).toBe(DEFAULT_MISSION);
    expect(getMissionText("   ")).toBe(DEFAULT_MISSION);
    expect(getMissionText("영금정과 동해가 함께 보이게 찍어주세요")).toBe(
      "영금정과 동해가 함께 보이게 찍어주세요",
    );
  });
});
