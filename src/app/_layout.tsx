import "../../global.css";

import { AuthProvider } from "@/stores/authStore";
import { initializeKakaoSDK } from "@react-native-kakao/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { SafeAreaProvider } from "react-native-safe-area-context";

// 웹에서 소셜 로그인 팝업이 리다이렉트(/oauth?code=...)로 돌아오면,
// 그 결과를 원래 창으로 넘기고 팝업을 닫는다. 이 호출이 없으면 팝업이
// /oauth 경로를 렌더하려다 "Unmatched Route"에서 멈춘다.
WebBrowser.maybeCompleteAuthSession();

// 카카오 네이티브 로그인 SDK 초기화 (app.json 의 nativeAppKey 와 같은 값).
initializeKakaoSDK("5a525ec5dccf4760b6654fe73a528857");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 30,
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
