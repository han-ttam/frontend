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

// 기본 redirect — 카카오·기타 provider 및 화면 표시용. 앱 스킴(handdam://oauth).
export const oauthRedirectUri = AuthSession.makeRedirectUri({
  scheme: "handdam",
  path: "oauth",
});

// 구글 iOS 클라이언트는 reversed client id 스킴을 redirect 로 요구한다.
// (642061...apps.googleusercontent.com → com.googleusercontent.apps.642061...)
const googleIosRedirectUri = () => {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

  if (!clientId) {
    return oauthRedirectUri;
  }

  const reversed = `com.googleusercontent.apps.${clientId.replace(
    /\.apps\.googleusercontent\.com$/,
    "",
  )}`;

  return AuthSession.makeRedirectUri({ native: `${reversed}:/oauth2redirect` });
};

// provider·플랫폼에 맞는 redirect 를 돌려준다.
// 구글 iOS 만 reversed client id 를 쓰고, 그 외에는 앱 스킴을 쓴다.
export const getRedirectUri = (provider: OAuthProvider) => {
  if (provider === "google" && Platform.OS === "ios") {
    return googleIosRedirectUri();
  }

  return oauthRedirectUri;
};

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
