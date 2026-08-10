import { formatNumber, formatRank } from "../format";

describe("formatNumber", () => {
  it("천 단위로 쉼표를 넣는다", () => {
    expect(formatNumber(15284)).toBe("15,284");
    expect(formatNumber(0)).toBe("0");
  });
});

describe("formatRank", () => {
  it("순위를 천 단위 쉼표로 보여준다", () => {
    expect(formatRank(127)).toBe("127");
    expect(formatRank(15284)).toBe("15,284");
  });

  it("아직 순위가 없으면 대시를 보여준다", () => {
    // 신규 사용자는 서버가 nationalRank: null 을 준다. 0위로 보이면 안 된다.
    expect(formatRank(null)).toBe("–");
    expect(formatRank(undefined)).toBe("–");
  });
});
