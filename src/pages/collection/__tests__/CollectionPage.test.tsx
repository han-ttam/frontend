import { fireEvent, render } from "@testing-library/react-native";

import CollectionPage from "../CollectionPage";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
  },
}));

describe("CollectionPage", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("shows the region grid first", async () => {
    const view = await render(<CollectionPage />);

    expect(view.getByText("서울 · 경기")).toBeTruthy();
    expect(view.queryByText("한강 피크닉 명소 모음")).toBeNull();
  });

  it("switches to the theme tab when pressed", async () => {
    const view = await render(<CollectionPage />);

    await fireEvent.press(view.getByTestId("collection-tab-themes"));

    expect(view.getByText("한강 피크닉 명소 모음")).toBeTruthy();
    expect(view.queryByText("서울 · 경기")).toBeNull();
  });

  it("switches to the recent tab when pressed", async () => {
    const view = await render(<CollectionPage />);

    await fireEvent.press(view.getByTestId("collection-tab-recent"));

    expect(view.getByText("남산서울타워")).toBeTruthy();
    expect(view.queryByText("한강 피크닉 명소 모음")).toBeNull();
  });

  it("goes back to the region tab", async () => {
    const view = await render(<CollectionPage />);

    await fireEvent.press(view.getByTestId("collection-tab-recent"));
    await fireEvent.press(view.getByTestId("collection-tab-regions"));

    expect(view.getByText("서울 · 경기")).toBeTruthy();
  });

  it("opens the dogam region detail with the province code", async () => {
    const view = await render(<CollectionPage />);

    await fireEvent.press(view.getByTestId("collection-region-32"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/collection/region/[code]",
      params: { code: "32" },
    });
  });

  // 도감 상세가 provinceCode 를 직접 키로 쓰면서, RegionId 로 풀리지 않아
  // 눌리지 않던 묶음 카드들이 열리게 됐다.
  it.each([
    ["33", "충청도"],
    ["35", "경상도"],
    ["37", "전라도"],
    ["90", "울릉도 · 독도"],
  ])(
    "opens grouped region %s (%s) that used to be blocked",
    async (code) => {
      const view = await render(<CollectionPage />);

      await fireEvent.press(view.getByTestId(`collection-region-${code}`));

      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/collection/region/[code]",
        params: { code },
      });
    },
  );

  it("does not open a locked region", async () => {
    const view = await render(<CollectionPage />);

    await fireEvent.press(view.getByTestId("collection-region-11"));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("opens the place detail from the recent tab", async () => {
    const view = await render(<CollectionPage />);

    await fireEvent.press(view.getByTestId("collection-tab-recent"));
    await fireEvent.press(view.getByTestId("collection-recent-namsan-tower"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/map/list/[id]",
      params: { id: "namsan-tower" },
    });
  });
});
