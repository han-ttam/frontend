import { fireEvent, render, screen } from "@testing-library/react-native";

import MyPage from "../MyPage";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

// 설정 모달이 useAuth 를 쓰므로, AuthProvider/SecureStore 없이도 렌더되도록
// 인증 스토어를 가짜로 대체한다.
jest.mock("@/stores/authStore", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    signOut: jest.fn(),
    withdraw: jest.fn(),
  }),
}));

// 설정 모달은 useSafeAreaInsets 를 쓰는데, 테스트엔 SafeAreaProvider 가 없어서
// insets 를 0 으로 고정하는 가짜 모듈로 대체한다.
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
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

  it("설정 아이콘을 누르면 로그아웃이 있는 설정 모달이 열린다", async () => {
    await render(<MyPage />);

    fireEvent.press(screen.getByLabelText("설정 열기"));

    expect(await screen.findByLabelText("로그아웃")).toBeTruthy();
    expect(screen.getByText("회원 탈퇴")).toBeTruthy();
  });
});
