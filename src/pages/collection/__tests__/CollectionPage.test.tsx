import type {
  DogamRecentItem,
  DogamRegion,
  DogamThemes,
} from "@/features/collection/types";
import { fireEvent, render } from "@testing-library/react-native";

import CollectionPage from "../CollectionPage";

const mockPush = jest.fn();
const mockReload = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
  },
}));

// 실기기에서 확인한 형태 그대로다 — sidoCode 를 provinceCode 로 매핑한 뒤의 값.
const regions: DogamRegion[] = [
  { provinceCode: "1", name: "서울 · 경기", collected: 12, total: 453, percent: 3, locked: false, imageUrl: null },
  { provinceCode: "32", name: "강원도", collected: 3, total: 779, percent: 0, locked: false, imageUrl: null },
  { provinceCode: "11", name: "잠긴 지역", collected: 0, total: 10, percent: 0, locked: true, imageUrl: null },
  { provinceCode: "33", name: "충청도", collected: 0, total: 300, percent: 0, locked: false, imageUrl: null },
  { provinceCode: "35", name: "경상도", collected: 0, total: 400, percent: 0, locked: false, imageUrl: null },
  { provinceCode: "37", name: "전라도", collected: 0, total: 350, percent: 0, locked: false, imageUrl: null },
  { provinceCode: "90", name: "울릉도 · 독도", collected: 0, total: 20, percent: 0, locked: false, imageUrl: null },
];

const themes: DogamThemes = {
  items: [
    { collectionId: "c1", title: "한강 피크닉 명소 모음", filled: 7, total: 10, thumbnails: [] },
  ],
  nextCursor: null,
};

const recent: DogamRecentItem[] = [
  { placeId: "namsan-tower", name: "남산서울타워", imageUrl: null, collectedAt: "2026-08-09T10:00:00.000Z" },
];

let mockState: ReturnType<
  typeof import("@/features/collection/useDogamData").useDogamData
>;

jest.mock("@/features/collection/useDogamData", () => ({
  useDogamData: () => mockState,
}));

jest.mock("@/stores/authStore", () => ({
  useAuth: () => ({ isAuthenticated: true, accessToken: "access-1" }),
}));

describe("CollectionPage", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReload.mockClear();
    mockState = {
      isAuthenticated: true,
      overview: { collected: 12, total: 1533, percent: 1 },
      regions,
      themes,
      recent,
      error: null,
      isLoading: false,
      reload: mockReload,
    };
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
