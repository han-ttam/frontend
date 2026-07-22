import { request } from "./client";

export type OAuthProvider = "kakao" | "google";

export type AuthUserDto = {
  id: string;
  handle: string;
  displayName: string;
};

export type AuthTokensDto = {
  accessToken: string;
  refreshToken: string;
};

export type AuthSessionDto = {
  user: AuthUserDto;
  tokens: AuthTokensDto;
};

// The swagger documents these responses as "201 / no content schema", so the
// shape below follows the login DTO in the design spec. Tokens may arrive
// nested under `tokens` or flattened onto the payload — accept both instead of
// silently handing an undefined token to the rest of the app.
type AuthSessionPayload = Partial<AuthTokensDto> & {
  user?: AuthUserDto;
  tokens?: Partial<AuthTokensDto>;
};

const toAuthTokens = (payload: AuthSessionPayload | undefined) => {
  const accessToken = payload?.tokens?.accessToken ?? payload?.accessToken;
  const refreshToken = payload?.tokens?.refreshToken ?? payload?.refreshToken;

  if (!accessToken || !refreshToken) {
    throw new Error("로그인 응답에 토큰이 없어요. 잠시 후 다시 시도해 주세요.");
  }

  return { accessToken, refreshToken };
};

export const loginWithOAuth = async (
  provider: OAuthProvider,
  providerAccessToken: string,
  signal?: AbortSignal,
): Promise<AuthSessionDto> => {
  const payload = await request<AuthSessionPayload>(
    `/api/auth/oauth/${provider}`,
    {
      method: "POST",
      body: { accessToken: providerAccessToken },
      signal,
    },
  );

  const tokens = toAuthTokens(payload);
  const user = payload?.user ?? (await fetchAuthMe(tokens.accessToken, signal));

  return { user, tokens };
};

export const refreshTokens = async (
  refreshToken: string,
  signal?: AbortSignal,
): Promise<AuthTokensDto> => {
  const payload = await request<AuthSessionPayload>("/api/auth/refresh", {
    method: "POST",
    body: { refreshToken },
    signal,
  });

  return toAuthTokens(payload);
};

export const logoutSession = (refreshToken: string, signal?: AbortSignal) => {
  return request<void>("/api/auth/logout", {
    method: "POST",
    body: { refreshToken },
    signal,
  });
};

export const fetchAuthMe = (accessToken: string, signal?: AbortSignal) => {
  return request<AuthUserDto>("/api/auth/me", { accessToken, signal });
};
