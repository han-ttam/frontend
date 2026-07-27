import {
  formatCollectedDate,
  formatCollectedRelative,
  toProgress,
} from "../format";

const NOW = new Date(2026, 6, 13);

const daysBefore = (days: number) => {
  const date = new Date(NOW);
  date.setDate(date.getDate() - days);

  return date.toISOString();
};

describe("toProgress", () => {
  it("returns 0 when the total is zero", () => {
    expect(toProgress(3, 0)).toBe(0);
  });

  it("clamps the ratio between 0 and 1", () => {
    expect(toProgress(5, 10)).toBe(0.5);
    expect(toProgress(12, 10)).toBe(1);
  });
});

describe("formatCollectedRelative", () => {
  it("labels the recent days", () => {
    expect(formatCollectedRelative(daysBefore(0), NOW)).toBe("오늘");
    expect(formatCollectedRelative(daysBefore(1), NOW)).toBe("어제");
    expect(formatCollectedRelative(daysBefore(3), NOW)).toBe("3일 전");
  });

  it("drops the relative label after a week so only the date shows", () => {
    expect(formatCollectedRelative(daysBefore(7), NOW)).toBeNull();
    expect(formatCollectedRelative(daysBefore(30), NOW)).toBeNull();
  });

  it("returns null for an invalid date", () => {
    expect(formatCollectedRelative("not-a-date", NOW)).toBeNull();
  });
});

describe("formatCollectedDate", () => {
  it("formats as YYYY.MM.DD", () => {
    expect(formatCollectedDate(new Date(2026, 0, 5).toISOString())).toBe(
      "2026.01.05",
    );
  });
});
