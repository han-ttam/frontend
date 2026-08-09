import type { MypageProfile, MypageRanking } from "@/features/mypage/types";
import { fireEvent, render, screen } from "@testing-library/react-native";

import MyPage from "../MyPage";

const mockPush = jest.fn();
const mockReload = jest.fn();

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

const profile: MypageProfile = {
  handle: "user_7ec12d47",
  displayName: "최서윤",
  avatarUrl: null,
  level: 1,
  exp: 0,
  expForNextLevel: 100,
  dogamPercent: 0,
  visitedCount: 0,
  nationalRank: null,
  totalUsers: 0,
};

const ranking: MypageRanking = {
  topPercent: null,
  top3: [],
  leaderboard: { items: [], nextCursor: null },
  me: { rank: null, score: 0, dogamPercent: 0, pointsToNext: 0 },
};

type MypageState = ReturnType<
  typeof import("@/features/mypage/useMypageData").useMypageData
>;

let mockState: MypageState;

jest.mock("@/features/mypage/useMypageData", () => ({
  useMypageData: () => mockState,
}));

const signedIn = (overrides: Partial<MypageState> = {}): MypageState =>
  ({
    isAuthenticated: true,
    profile,
    ranking,
    collections: [],
    overall: { collected: 0, total: 7658 },
    error: null,
    isLoading: false,
    reload: mockReload,
    ...overrides,
  }) as MypageState;

describe("MyPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState = signedIn();
  });

  it("게스트에게는 로그인 유도를 보여준다", async () => {
    mockState = signedIn({
      isAuthenticated: false,
      profile: undefined,
      ranking: undefined,
      overall: undefined,
    });

    await render(<MyPage />);

    expect(
      screen.getByText("로그인하면 내 도감과 랭킹을 볼 수 있어요"),
    ).toBeTruthy();
    expect(screen.getByLabelText("로그인하기")).toBeTruthy();
  });

  it("로그인 버튼을 누르면 로그인 화면으로 보낸다", async () => {
    mockState = signedIn({
      isAuthenticated: false,
      profile: undefined,
      ranking: undefined,
      overall: undefined,
    });

    await render(<MyPage />);
    fireEvent.press(screen.getByLabelText("로그인하기"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/login",
      params: { redirect: "/mypage" },
    });
  });

  it("불러오는 중에는 안내 문구를 보여준다", async () => {
    mockState = signedIn({ profile: undefined, isLoading: true });

    await render(<MyPage />);

    expect(screen.getByText("내 정보를 불러오는 중이에요")).toBeTruthy();
  });

  it("프로필을 못 불러오면 다시 시도를 준다", async () => {
    mockState = signedIn({
      profile: undefined,
      error: new Error("HTTP 500"),
    });

    await render(<MyPage />);
    expect(screen.getByText("내 정보를 불러오지 못했어요")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("다시 시도"));
    expect(mockReload).toHaveBeenCalled();
  });

  it("서버에서 온 프로필을 보여준다", async () => {
    await render(<MyPage />);

    expect(screen.getByText("최서윤")).toBeTruthy();
    expect(screen.getByText("Lv. 1")).toBeTruthy();
  });

  it("아직 순위가 없으면 0위가 아니라 대시로 보여준다", async () => {
    await render(<MyPage />);

    expect(screen.getAllByText("–").length).toBeGreaterThan(0);
  });

  it("모음이 없으면 빈 상태를 보여준다", async () => {
    await render(<MyPage />);

    expect(screen.getByText("아직 모은 도감이 없어요.")).toBeTruthy();
  });

  it("모음이 있으면 카드를 누를 때 그 모음의 상세로 이동한다", async () => {
    mockState = signedIn({
      collections: [
        {
          id: "019f3840-0000-7000-8000-000000000001",
          title: "한강 피크닉 명소 모음",
          filled: 7,
          total: 10,
          coverImageUrl: null,
          thumbnails: [],
        },
      ],
    });

    await render(<MyPage />);
    fireEvent.press(screen.getByLabelText("한강 피크닉 명소 모음 도감 보기"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/mypage/collections/[id]",
      params: { id: "019f3840-0000-7000-8000-000000000001" },
    });
  });

  it("설정 아이콘을 누르면 로그아웃이 있는 설정 모달이 열린다", async () => {
    await render(<MyPage />);

    fireEvent.press(screen.getByLabelText("설정 열기"));

    expect(await screen.findByLabelText("로그아웃")).toBeTruthy();
    expect(screen.getByText("회원 탈퇴")).toBeTruthy();
  });
});
