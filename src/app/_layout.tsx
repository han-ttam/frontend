import "../../global.css";

import { router, Stack } from "expo-router";

export default function RootLayout() {
  router.replace("/(tabs)/map");
  return <Stack screenOptions={{ headerShown: false }} />;
}
