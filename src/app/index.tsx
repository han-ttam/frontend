import LandingPage from "@/pages/landing/LandingPage";
import { useMapData } from "@/features/map/useMapData";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

const MIN_LANDING_DURATION_MS = 2400;
const LANDING_COMPLETE_HOLD_MS = 350;

export default function HomeScreen() {
  const { data, error, isLoading } = useMapData();
  const [canLeaveLanding, setCanLeaveLanding] = useState(false);
  const [canRedirect, setCanRedirect] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanLeaveLanding(true);
    }, MIN_LANDING_DURATION_MS);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!data || !canLeaveLanding) {
      return;
    }

    const timer = setTimeout(() => {
      setCanRedirect(true);
    }, LANDING_COMPLETE_HOLD_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [canLeaveLanding, data]);

  if (data && canRedirect) {
    return <Redirect href="/map" />;
  }

  return (
    <LandingPage
      data={data}
      error={error}
      isLoading={isLoading}
      minLoadingDurationMs={MIN_LANDING_DURATION_MS}
    />
  );
}
