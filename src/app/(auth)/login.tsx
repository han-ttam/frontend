import LoginPage from "@/pages/auth/LoginPage";
import { router, useLocalSearchParams, type Href } from "expo-router";

export default function LoginScreen() {
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();

  const goBackOrMap = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/map");
  };

  const handleLoggedIn = () => {
    if (redirect) {
      router.replace(redirect as Href);
      return;
    }

    goBackOrMap();
  };

  return <LoginPage onLoggedIn={handleLoggedIn} onSkip={goBackOrMap} />;
}
