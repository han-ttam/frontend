import LandingPage from "@/pages/landing/LandingPage";
import { Redirect } from "expo-router";

export default function HomeScreen() {
  const isData = true;
  return isData ? <Redirect href="/map" /> : <LandingPage />;
}
