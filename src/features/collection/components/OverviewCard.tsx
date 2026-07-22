import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { ProgressBar } from "@/features/collection/components/ProgressBar";
import { toProgress } from "@/features/collection/format";
import type { DogamOverview } from "@/features/collection/types";
import { useCollectionLayout } from "@/features/collection/useCollectionLayout";
import { Entypo } from "@expo/vector-icons";
import { View } from "react-native";

type OverviewCardProps = {
  overview: DogamOverview;
};

export const OverviewCard = ({ overview }: OverviewCardProps) => {
  const { overviewPercentSize, isCompact } = useCollectionLayout();

  return (
    <View className="flex-row gap-3 rounded-2xl border border-foreground/10 bg-surface p-4">
      <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
        <Entypo name="map" size={22} color={colors.primary} />
      </View>

      <View className="flex-1 gap-2">
        <View className="flex-row items-start justify-between gap-2">
          <View className="shrink gap-1">
            <AppText color="muted" size={13} style={{ fontWeight: "600" }}>
              전국 수집 현황
            </AppText>
            <View className="flex-row items-end">
              <AppText
                color="primary"
                style={{
                  fontSize: overviewPercentSize,
                  lineHeight: overviewPercentSize + 6,
                  fontWeight: "800",
                }}
              >
                {overview.percent}
              </AppText>
              <AppText
                color="primary"
                style={{
                  fontSize: Math.round(overviewPercentSize * 0.55),
                  lineHeight: overviewPercentSize,
                  fontWeight: "800",
                }}
              >
                %
              </AppText>
            </View>
          </View>

          <View className="shrink items-end gap-1">
            <View className="flex-row items-end">
              <AppText color="primary" size={16} style={{ fontWeight: "800" }}>
                {overview.collected}
              </AppText>
              <AppText color="muted" size={13}>
                {" "}
                / {overview.total}
              </AppText>
            </View>
            <AppText
              color="muted"
              size={isCompact ? 11 : 12}
              style={{ textAlign: "right" }}
            >
              {"대한민국 곳곳의 추억을\n모으고 있어요!"}
            </AppText>
          </View>
        </View>

        <ProgressBar
          progress={toProgress(overview.collected, overview.total)}
          height={7}
        />
      </View>
    </View>
  );
};
