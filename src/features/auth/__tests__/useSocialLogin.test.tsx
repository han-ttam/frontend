import { act, renderHook } from "@testing-library/react-native";
import { Platform } from "react-native";

import { useSocialLogin } from "../useSocialLogin";

const mockSignIn = jest.fn();
const mockPromptAsync = jest.fn();
const mockExchangeCodeAsync = jest.fn();
const mockKakaoNativeLogin = jest.fn();
const mockLoginWithOAuth = jest.fn();
let mockRequest: { codeVerifier?: string } | null = null;

jest.mock("expo-auth-session", () => ({
  ResponseType: { Code: "code" },
  makeRedirectUri: () => "handdam://oauth",
  useAuthRequest: () => [mockRequest, null, mockPromptAsync],
  exchangeCodeAsync: (...args: unknown[]) => mockExchangeCodeAsync(...args),
}));

// 카카오 네이티브 SDK 는 jest 에서 로드할 수 없으므로(네이티브 모듈) 목킹한다.
jest.mock("@react-native-kakao/user", () => ({
  login: (...args: unknown[]) => mockKakaoNativeLogin(...args),
}));

jest.mock("@/stores/authStore", () => ({
  useAuth: () => ({ signIn: mockSignIn }),
}));

jest.mock("@/lib/api/auth", () => ({
  loginWithOAuth: (...args: unknown[]) => mockLoginWithOAuth(...args),
}));

const originalOS = Platform.OS;

describe("useSocialLogin", () => {
  const originalKakaoKey = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = { codeVerifier: "verifier-1" };
    process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY = "kakao-rest-key";
    // 기본은 웹: 카카오도 브라우저(OAuth) 경로를 탄다.
    Platform.OS = "web";
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY = originalKakaoKey;
    Platform.OS = originalOS;
  });

  it("explains which key is missing instead of crashing", async () => {
    delete process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;

    const { result } = await renderHook(() => useSocialLogin());

    await act(async () => {
      await result.current.login("kakao");
    });

    expect(result.current.error?.message).toContain(
      "EXPO_PUBLIC_KAKAO_REST_API_KEY",
    );
    expect(mockPromptAsync).not.toHaveBeenCalled();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("exchanges the provider code and signs the user in (web)", async () => {
    const session = {
      user: { id: "u1", handle: "handdam", displayName: "한담" },
      tokens: { accessToken: "access-1", refreshToken: "refresh-1" },
    };
    const onSuccess = jest.fn();

    mockPromptAsync.mockResolvedValue({
      type: "success",
      params: { code: "auth-code" },
    });
    mockExchangeCodeAsync.mockResolvedValue({
      accessToken: "kakao-provider-token",
    });
    mockLoginWithOAuth.mockResolvedValue(session);

    const { result } = await renderHook(() => useSocialLogin(onSuccess));

    await act(async () => {
      await result.current.login("kakao");
    });

    expect(mockLoginWithOAuth).toHaveBeenCalledWith(
      "kakao",
      "kakao-provider-token",
    );
    expect(mockSignIn).toHaveBeenCalledWith(session);
    expect(onSuccess).toHaveBeenCalled();
    expect(result.current.error).toBeUndefined();
  });

  it("uses the Kakao SDK on native and signs the user in", async () => {
    Platform.OS = "ios";

    const session = {
      user: { id: "u1", handle: "handdam", displayName: "한담" },
      tokens: { accessToken: "access-1", refreshToken: "refresh-1" },
    };

    mockKakaoNativeLogin.mockResolvedValue({
      accessToken: "kakao-native-token",
    });
    mockLoginWithOAuth.mockResolvedValue(session);

    const { result } = await renderHook(() => useSocialLogin());

    await act(async () => {
      await result.current.login("kakao");
    });

    // 네이티브에서는 브라우저(OAuth) 를 열지 않고 카카오 SDK 로 바로 로그인한다.
    expect(mockKakaoNativeLogin).toHaveBeenCalled();
    expect(mockPromptAsync).not.toHaveBeenCalled();
    expect(mockLoginWithOAuth).toHaveBeenCalledWith(
      "kakao",
      "kakao-native-token",
    );
    expect(mockSignIn).toHaveBeenCalledWith(session);
  });

  it("stays silent when the user closes the provider sheet", async () => {
    mockPromptAsync.mockResolvedValue({ type: "cancel" });

    const { result } = await renderHook(() => useSocialLogin());

    await act(async () => {
      await result.current.login("kakao");
    });

    expect(mockLoginWithOAuth).not.toHaveBeenCalled();
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(result.current.error).toBeUndefined();
    expect(result.current.pendingProvider).toBeUndefined();
  });

  it("surfaces a failed token exchange", async () => {
    mockPromptAsync.mockResolvedValue({
      type: "success",
      params: { code: "auth-code" },
    });
    mockExchangeCodeAsync.mockRejectedValue(new Error("invalid_grant"));

    const { result } = await renderHook(() => useSocialLogin());

    await act(async () => {
      await result.current.login("kakao");
    });

    expect(result.current.error?.message).toBe("invalid_grant");
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});
