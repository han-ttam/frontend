import type { CollectionDetail } from "@/features/mypage/types";
import { fireEvent, render, screen } from "@testing-library/react-native";

import CollectionDetailPage from "../CollectionDetailPage";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReload = jest.fn();

let mockParams: { id?: string } = { id: "hangang-picnic" };
let mockState: {
  data: CollectionDetail | undefined;
  error: Error | null;
  isLoading: boolean;
} = {
  data: undefined,
  error: null,
  isLoading: false,
};

jest.mock("expo-router", () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    back: () => mockBack(),
  },
  useLocalSearchParams: () => mockParams,
}));

jest.mock("@/features/mypage/useCollectionDetailData", () => ({
  useCollectionDetailData: () => ({ ...mockState, reload: mockReload }),
}));

const place = (
  index: number,
  visitStatus: CollectionDetail["items"][number]["visitStatus"],
) => ({
  placeId: `place-${index}`,
  name: `명소 ${index}`,
  address: `서울특별시 어딘가 ${index}`,
  imageUrl: index % 2 === 0 ? null : `https://example.com/${index}.jpg`,
  visitStatus,
});

const detail: CollectionDetail = {
  id: "hangang-picnic",
  title: "한강 피크닉 명소 모음",
  description: "한강을 따라 걷는 피크닉 스팟 10곳",
  type: "THEME",
  coverImageUrl: null,
  progress: { collected: 7, total: 10 },
  items: [
    ...Array.from({ length: 7 }, (_, index) => place(index + 1, "VISITED")),
    ...Array.from({ length: 3 }, (_, index) => place(index + 8, "NONE")),
  ],
  nextCursor: null,
};

const setState = (next: Partial<typeof mockState>) => {
  mockState = { data: undefined, error: null, isLoading: false, ...next };
};

describe("CollectionDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = { id: "hangang-picnic" };
    setState({ data: detail });
  });

  it("모음 제목·설명·종류 배지를 보여준다", async () => {
    await render(<CollectionDetailPage />);

    expect(screen.getByText("한강 피크닉 명소 모음")).toBeTruthy();
    expect(screen.getByText("한강을 따라 걷는 피크닉 스팟 10곳")).toBeTruthy();
    expect(screen.getByText("테마 모음")).toBeTruthy();
  });

  it("수집 현황을 목록에서 센 값으로 보여준다", async () => {
    setState({ data: { ...detail, progress: { collected: 99, total: 99 } } });

    await render(<CollectionDetailPage />);

    expect(screen.getByLabelText("수집 현황 7 / 10곳")).toBeTruthy();
  });

  it("명소를 이름·주소와 함께 목록으로 보여준다", async () => {
    await render(<CollectionDetailPage />);

    expect(screen.getByText("명소 1")).toBeTruthy();
    expect(screen.getByText("서울특별시 어딘가 1")).toBeTruthy();
    expect(screen.getAllByLabelText(/명소 \d+, (수집함|미수집)/)).toHaveLength(
      10,
    );
  });

  it("미수집 명소는 텍스트로도 상태를 알려준다", async () => {
    await render(<CollectionDetailPage />);

    expect(screen.getAllByText("미수집")).toHaveLength(3);
    expect(screen.getByLabelText("명소 8, 미수집")).toBeTruthy();
    expect(screen.getByLabelText("명소 1, 수집함")).toBeTruthy();
  });

  it("불러오는 중에는 로딩 표시를 보여준다", async () => {
    setState({ isLoading: true });

    await render(<CollectionDetailPage />);

    expect(screen.getByLabelText("목록을 불러오는 중")).toBeTruthy();
  });

  it("실패하면 안내와 다시 시도를 보여준다", async () => {
    setState({ error: new Error("boom") });

    await render(<CollectionDetailPage />);

    expect(screen.getByText("목록을 불러오지 못했어요")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("다시 시도"));

    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  it("명소가 없는 모음은 안내 문구를 보여준다", async () => {
    setState({ data: { ...detail, items: [] } });

    await render(<CollectionDetailPage />);

    expect(screen.getByText("한강 피크닉 명소 모음")).toBeTruthy();
    expect(screen.getByText("아직 등록된 명소가 없어요.")).toBeTruthy();
  });

  it("id 가 없으면 찾을 수 없다고 안내한다", async () => {
    mockParams = {};

    await render(<CollectionDetailPage />);

    expect(screen.getByText("모음을 찾을 수 없어요")).toBeTruthy();
  });

  it("없는 모음이면 찾을 수 없다고 안내한다", async () => {
    mockParams = { id: "no-such-collection" };
    setState({ error: new Error("Collection not found") });

    await render(<CollectionDetailPage />);

    expect(screen.getByText("모음을 찾을 수 없어요")).toBeTruthy();
  });

  it("명소를 누르면 그 장소의 상세로 이동한다", async () => {
    await render(<CollectionDetailPage />);

    fireEvent.press(screen.getByLabelText("명소 1, 수집함"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/map/list/[id]",
      params: { id: "place-1" },
    });
  });

  it("미수집 명소도 눌러서 상세를 볼 수 있다", async () => {
    await render(<CollectionDetailPage />);

    fireEvent.press(screen.getByLabelText("명소 8, 미수집"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/map/list/[id]",
      params: { id: "place-8" },
    });
  });

  it("화면을 보는 것만으로는 수집 상태가 바뀌지 않는다", async () => {
    await render(<CollectionDetailPage />);

    fireEvent.press(screen.getByLabelText("명소 8, 미수집"));

    expect(screen.getByLabelText("명소 8, 미수집")).toBeTruthy();
    expect(screen.getByLabelText("수집 현황 7 / 10곳")).toBeTruthy();
  });

  it("전부 수집한 모음에는 미수집 표시가 없다", async () => {
    setState({
      data: {
        ...detail,
        items: Array.from({ length: 10 }, (_, index) =>
          place(index + 1, "VISITED"),
        ),
      },
    });

    await render(<CollectionDetailPage />);

    expect(screen.queryByText("미수집")).toBeNull();
    expect(screen.getByLabelText("수집 현황 10 / 10곳")).toBeTruthy();
  });

  it("한 곳도 수집하지 않은 모음도 목록을 그대로 보여준다", async () => {
    setState({
      data: {
        ...detail,
        items: Array.from({ length: 10 }, (_, index) =>
          place(index + 1, "NONE"),
        ),
      },
    });

    await render(<CollectionDetailPage />);

    expect(screen.getAllByText("미수집")).toHaveLength(10);
    expect(screen.getByLabelText("수집 현황 0 / 10곳")).toBeTruthy();
  });

  it("주소가 없는 명소도 이름만으로 표시한다", async () => {
    setState({
      data: {
        ...detail,
        items: [{ ...place(1, "VISITED"), address: null }],
      },
    });

    await render(<CollectionDetailPage />);

    expect(screen.getByText("명소 1")).toBeTruthy();
    expect(screen.queryByText("서울특별시 어딘가 1")).toBeNull();
  });

  it("뒤로 가기를 누르면 이전 화면으로 돌아간다", async () => {
    await render(<CollectionDetailPage />);

    fireEvent.press(screen.getByLabelText("뒤로 가기"));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
