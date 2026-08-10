import { render, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";

import { AuthProvider } from "../authStore";

const mockRefreshTokens = jest.fn();
const mockSaveTokens = jest.fn();
const mockClearTokens = jest.fn();
const mockLoadTokens = jest.fn();

// AuthProvider 가 client 에 꽂는 갱신 핸들러를 붙잡는다.
let registeredHandler: (() => Promise<string | undefined>) | undefined;

jest.mock("@/lib/api/client", () => ({
  setAuthRefreshHandler: (handler?: () => Promise<string | undefined>) => {
    registeredHandler = handler;
  },
}));

jest.mock("@/lib/api/auth", () => ({
  refreshTokens: (...args: unknown[]) => mockRefreshTokens(...args),
  logoutSession: jest.fn(),
  withdrawAccount: jest.fn(),
}));

jest.mock("@/lib/auth/tokenStorage", () => ({
  loadTokens: () => mockLoadTokens(),
  saveTokens: (...args: unknown[]) => mockSaveTokens(...args),
  clearTokens: () => mockClearTokens(),
  loadLoginSkipped: () => Promise.resolve(false),
  saveLoginSkipped: jest.fn(),
  clearLoginSkipped: jest.fn(),
}));

const renderProvider = async () => {
  const view = await render(
    <AuthProvider>
      <Text>자식</Text>
    </AuthProvider>,
  );

  await waitFor(() => {
    expect(registeredHandler).toBeDefined();
  });

  return view;
};

describe("AuthProvider 토큰 갱신 핸들러", () => {
  beforeEach(() => {
    registeredHandler = undefined;
    mockRefreshTokens.mockReset();
    mockSaveTokens.mockReset().mockResolvedValue(undefined);
    mockClearTokens.mockReset().mockResolvedValue(undefined);
    mockLoadTokens
      .mockReset()
      .mockResolvedValue({ accessToken: "access-1", refreshToken: "refresh-1" });
  });

  it("마운트하면 갱신 핸들러를 client 에 등록한다", async () => {
    await renderProvider();

    expect(registeredHandler).toBeInstanceOf(Function);
  });

  it("갱신에 성공하면 새 토큰을 저장하고 액세스 토큰을 돌려준다", async () => {
    mockRefreshTokens.mockResolvedValue({
      accessToken: "access-2",
      refreshToken: "refresh-2",
    });

    await renderProvider();

    await waitFor(async () => {
      await expect(registeredHandler!()).resolves.toBe("access-2");
    });

    expect(mockRefreshTokens).toHaveBeenCalledWith("refresh-1");
    expect(mockSaveTokens).toHaveBeenCalledWith({
      accessToken: "access-2",
      refreshToken: "refresh-2",
    });
  });

  it("갱신에 실패하면 세션을 비우고 undefined 를 돌려준다", async () => {
    mockRefreshTokens.mockRejectedValue(new Error("refresh 만료"));

    await renderProvider();

    await waitFor(async () => {
      await expect(registeredHandler!()).resolves.toBeUndefined();
    });

    expect(mockClearTokens).toHaveBeenCalled();
  });

  it("refreshToken 이 없으면 갱신을 시도하지 않는다", async () => {
    mockLoadTokens.mockResolvedValue(undefined);

    await renderProvider();

    await expect(registeredHandler!()).resolves.toBeUndefined();
    expect(mockRefreshTokens).not.toHaveBeenCalled();
  });
});
