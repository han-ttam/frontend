import { login as kakaoNativeLogin } from "@react-native-kakao/user";
import { loginWithOAuth, type OAuthProvider } from "@/lib/api/auth";
import { useAuth } from "@/stores/authStore";
import * as AuthSession from "expo-auth-session";
import { useState } from "react";
import { Platform } from "react-native";
import {
  getOAuthConfig,
  getRedirectUri,
  missingKeyMessages,
} from "./oauthProviders";

// 카카오는 네이티브(iOS/Android)에서 커스텀 스킴 redirect 를 못 써서
// 브라우저(expo-auth-session) 대신 카카오 SDK 로 로그인한다. 웹은 그대로 브라우저.
const isKakaoNative = (provider: OAuthProvider) =>
  provider === "kakao" && Platform.OS !== "web";

// Kakao and Google both speak authorization-code + PKCE, so one request shape
// covers them. The provider access token this returns is not ours — the server
// re-validates it against Kakao/Google before issuing a handdam session.
const useProviderAuthorize = (provider: OAuthProvider) => {
  const config = getOAuthConfig(provider);
  const redirectUri = getRedirectUri(provider);

  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: config?.clientId ?? "",
      scopes: config?.scopes ?? [],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    // Passing null keeps the request unbuilt, so a missing key never crashes
    // the screen — the button just reports what is missing.
    config?.discovery ?? null,
  );

  const authorize = async () => {
    if (!config) {
      throw new Error(missingKeyMessages[provider]);
    }

    if (!request) {
      throw new Error("로그인 준비 중이에요. 잠시 후 다시 시도해 주세요.");
    }

    const result = await promptAsync();

    if (result.type === "cancel" || result.type === "dismiss") {
      return undefined;
    }

    if (result.type !== "success") {
      throw new Error("로그인 창을 여는 데 실패했어요. 다시 시도해 주세요.");
    }

    const tokens = await AuthSession.exchangeCodeAsync(
      {
        clientId: config.clientId,
        code: result.params.code,
        redirectUri,
        extraParams: request.codeVerifier
          ? { code_verifier: request.codeVerifier }
          : undefined,
      },
      config.discovery,
    );

    // Kakao 백엔드는 access token(→userinfo)을, Google 백엔드는 id_token(→tokeninfo)을
    // 검증한다. 그래서 구글은 access token 대신 openid 스코프로 받은 id_token 을 보낸다.
    if (provider === "google") {
      if (!tokens.idToken) {
        throw new Error(
          "구글 로그인에서 id_token 을 받지 못했어요. 다시 시도해 주세요.",
        );
      }
      return tokens.idToken;
    }

    return tokens.accessToken;
  };

  return { authorize };
};

export const useSocialLogin = (onSuccess?: () => void) => {
  const { signIn } = useAuth();
  const [pendingProvider, setPendingProvider] = useState<OAuthProvider>();
  const [error, setError] = useState<Error>();

  const authorizers: Record<OAuthProvider, ReturnType<typeof useProviderAuthorize>> =
    {
      kakao: useProviderAuthorize("kakao"),
      google: useProviderAuthorize("google"),
    };

  const login = async (provider: OAuthProvider) => {
    setError(undefined);
    setPendingProvider(provider);

    try {
      const providerAccessToken = isKakaoNative(provider)
        ? (await kakaoNativeLogin()).accessToken
        : await authorizers[provider].authorize();

      if (!providerAccessToken) {
        return;
      }

      const session = await loginWithOAuth(provider, providerAccessToken);
      await signIn(session);
      onSuccess?.();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught
          : new Error("로그인에 실패했어요. 다시 시도해 주세요."),
      );
    } finally {
      setPendingProvider(undefined);
    }
  };

  return { login, pendingProvider, error };
};
