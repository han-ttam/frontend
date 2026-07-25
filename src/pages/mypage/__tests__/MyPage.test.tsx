import { fireEvent, render, screen } from "@testing-library/react-native";

import MyPage from "../MyPage";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    back: jest.fn(),
  },
}));

describe("MyPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("도감 진행률 탭에 모음 카드를 보여준다", async () => {
    await render(<MyPage />);

    expect(screen.getByText("한강 피크닉 명소 모음")).toBeTruthy();
  });

  it("모음 카드를 누르면 그 모음의 상세로 이동한다", async () => {
    await render(<MyPage />);

    fireEvent.press(screen.getByLabelText("한강 피크닉 명소 모음 도감 보기"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/mypage/collections/[id]",
      params: { id: "hangang-picnic" },
    });
  });
});
