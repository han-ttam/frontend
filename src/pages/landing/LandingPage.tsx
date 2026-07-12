import { AppText } from "@/components/AppText";
import { type KoreaRegionId } from "@/components/Korea";
import { KoreaMap } from "@/components/KoreaMap";
import ProgressCircle from "@/components/ui/ProgressCircle";
import RegionMarker from "@/components/ui/RegionMarker";
import { colors } from "@/constants/colors";
import { regionLabels, regions } from "@/constants/regions";
import { useLandingData } from "@/features/landing/useLandingData";
import type { LandingDto } from "@/lib/api/landing";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

const DEFAULT_MIN_LOADING_DURATION_MS = 2400;
const COMPLETE_PROGRESS_RATIO = 0.9;

type LandingPageProps = {
  data?: Pick<LandingDto, "summary" | "provinces">;
  error?: Error;
  isLoading?: boolean;
  minLoadingDurationMs?: number;
};

export default function LandingPage({
  data: externalData,
  error: externalError,
  isLoading: externalIsLoading,
  minLoadingDurationMs = DEFAULT_MIN_LOADING_DURATION_MS,
}: LandingPageProps = {}) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const loadingStartedAt = useRef(Date.now());
  const [selectedRegionId, setSelectedRegionId] =
    useState<KoreaRegionId>();
  const hasExternalState =
    externalData != null ||
    externalError != null ||
    externalIsLoading != null;
  const landingQuery = useLandingData(!hasExternalState);
  const data = externalData ?? landingQuery.data;
  const error = externalError ?? landingQuery.error;
  const isLoading = externalIsLoading ?? landingQuery.isLoading;

  useEffect(() => {
    let mounted = true;
    const progressLimit = 0.92;
    const progressDurationMs =
      minLoadingDurationMs * COMPLETE_PROGRESS_RATIO;

    const progressTimer = setInterval(() => {
      if (!mounted) {
        return;
      }

      const elapsedMs = Date.now() - loadingStartedAt.current;
      const timeProgress = Math.min(1, elapsedMs / progressDurationMs);
      const nextProgress = isLoading
        ? Math.min(progressLimit, timeProgress)
        : timeProgress;

      setLoadingProgress(nextProgress);
    }, 50);

    return () => {
      mounted = false;
      clearInterval(progressTimer);
    };
  }, [isLoading, minLoadingDurationMs]);

  const provinceByCode = new Map(
    data?.provinces.map((province) => [province.provinceCode, province]),
  );
  const progress = data?.summary.progress;

  return (
    <View className="items-center justify-center w-screen h-full gap-5 bg-background">
      <View className="items-center">
        <MaterialCommunityIcons
          name="map-marker-outline"
          size={32}
          color={colors.primary}
        />
        <AppText variant="display">
          한 :
          <AppText variant="display" color="primary">
            {" 땀"}
          </AppText>
        </AppText>
      </View>

      {/* <AppText variant="body" color="muted">
        나의 여행지도를 불러오는 중이에요
      </AppText> */}

      <View className="relative w-full aspect-[800/1080]">
        <KoreaMap
          selectedRegionId={selectedRegionId}
          onRegionPress={setSelectedRegionId}
        />

        {regions.map((region) => (
          <RegionMarker
            key={region.id}
            name={regionLabels[region.id]}
            total={provinceByCode.get(region.id)?.collected ?? "-"}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: `${region.x * 100}%`,
              top: `${region.y * 100}%`,
              transform: [{ translateX: -10 }, { translateY: -20 }],
            }}
          />
        ))}
      </View>

      <View className="flex-row items-center gap-3 justify-center w-full p-2">
        <ProgressCircle size={64} progress={loadingProgress} />
        <View>
          <AppText size={16}>여행 기록 불러오는 중</AppText>
          <AppText variant="body" color="muted">
            {error
              ? "API data is not available. Check EXPO_PUBLIC_API_BASE_URL."
              : progress
                ? `${progress.collected} / ${progress.total}`
                : "전국 여행 데이터를 수집하고 있어요"}
          </AppText>
        </View>
      </View>
    </View>
  );
}
