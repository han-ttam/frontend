import type { OAuthProvider } from "@/lib/api/auth";
import * as AuthSession from "expo-auth-session";
import { Platform } from "react-native";

export type OAuthProviderConfig = {
  clientId: string;
  scopes: string[];
  discovery: AuthSession.DiscoveryDocument;
};

const discoveries: Record<OAuthProvider, AuthSession.DiscoveryDocument> = {
  kakao: {
    authorizationEndpoint: "https://kauth.kakao.com/oauth/authorize",
    tokenEndpoint: "https://kauth.kakao.com/oauth/token",
  },
  google: {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
  },
};

const scopes: Record<OAuthProvider, string[]> = {
  kakao: ["profile_nickname"],
  google: ["openid", "profile", "email"],
};

// Each Google client type is registered against a different platform, so the
// key that works on iOS is rejected on Android.
const getGoogleClientId = () => {
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    default: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });
};

const getClientId = (provider: OAuthProvider) => {
  return provider === "kakao"
    ? process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY
    : getGoogleClientId();
};

export const oauthRedirectUri = AuthSession.makeRedirectUri({
  scheme: "handdam",
  path: "oauth",
});

export const getOAuthConfig = (
  provider: OAuthProvider,
): OAuthProviderConfig | undefined => {
  const clientId = getClientId(provider);

  if (!clientId) {
    return undefined;
  }

  return {
    clientId,
    scopes: scopes[provider],
    discovery: discoveries[provider],
  };
};

export const missingKeyMessages: Record<OAuthProvider, string> = {
  kakao:
    "카카오 앱 키가 아직 없어요. .env에 EXPO_PUBLIC_KAKAO_REST_API_KEY를 채워주세요.",
  google:
    "구글 클라이언트 ID가 아직 없어요. .env에 EXPO_PUBLIC_GOOGLE_*_CLIENT_ID를 채워주세요.",
};
