import { act, renderHook } from "@testing-library/react-native";

import { useSocialLogin } from "../useSocialLogin";

const mockSignIn = jest.fn();
const mockPromptAsync = jest.fn();
const mockExchangeCodeAsync = jest.fn();
let mockRequest: { codeVerifier?: string } | null = null;

jest.mock("expo-auth-session", () => ({
  ResponseType: { Code: "code" },
  makeRedirectUri: () => "handdam://oauth",
  useAuthRequest: () => [mockRequest, null, mockPromptAsync],
  exchangeCodeAsync: (...args: unknown[]) => mockExchangeCodeAsync(...args),
}));

jest.mock("@/stores/authStore", () => ({
  useAuth: () => ({ signIn: mockSignIn }),
}));

jest.mock("@/lib/api/auth", () => ({
  loginWithOAuth: (...args: unknown[]) => mockLoginWithOAuth(...args),
}));

const mockLoginWithOAuth = jest.fn();

describe("useSocialLogin", () => {
  const originalKakaoKey = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = { codeVerifier: "verifier-1" };
    process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY = "kakao-rest-key";
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY = originalKakaoKey;
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

  it("exchanges the provider code and signs the user in", async () => {
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
