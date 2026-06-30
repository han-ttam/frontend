import { AppText } from "@/components/AppText";
import { type KoreaRegionId } from "@/components/Korea";
import { KoreaMap } from "@/components/KoreaMap";
import ProgressCircle from "@/components/ui/ProgressCircle";
import RegionMarker from "@/components/ui/RegionMarker";
import { colors } from "@/constants/colors";
import { regionLabels, regions } from "@/constants/regions";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function LandingPage() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedRegionId, setSelectedRegionId] =
    useState<KoreaRegionId>();

  useEffect(() => {
    let mounted = true;
    const progressLimit = 0.92;

    const progressTimer = setInterval(() => {
      setLoadingProgress((progress) => {
        if (progress >= progressLimit) {
          return progress;
        }

        const distanceToLimit = progressLimit - progress;
        return Math.min(
          progressLimit,
          progress + Math.max(0.0007, distanceToLimit * 0.008),
        );
      });
    }, 240);

    const loadLandingData = async () => {
      try {
        // 예: 지역 데이터 준비
        await new Promise((resolve) => setTimeout(resolve, 2400));
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // 예: 여행 기록 데이터 요청

        // 예: 화면에 필요한 데이터 정리
      } finally {
        clearInterval(progressTimer);

        if (mounted) {
          setLoadingProgress(1);
        }
      }
    };

    loadLandingData();

    return () => {
      mounted = false;
      clearInterval(progressTimer);
    };
  }, []);

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
            total={260}
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
            전국 여행 데이터를 수집하고 있어요
          </AppText>
        </View>
      </View>
    </View>
  );
}
