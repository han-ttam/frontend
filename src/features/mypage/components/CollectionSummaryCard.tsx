import { AppText } from "@/components/AppText";
import { ProgressBar } from "@/features/mypage/components/ProgressBar";
import { toProgress } from "@/features/mypage/format";
import { View } from "react-native";

type CollectionSummaryCardProps = {
  collected: number;
  total: number;
};

export const CollectionSummaryCard = ({
  collected,
  total,
}: CollectionSummaryCardProps) => {
  if (total <= 0) {
    return null;
  }

  return (
    <View
      accessible
      accessibilityLabel={`수집 현황 ${collected} / ${total}곳`}
      className="gap-3 rounded-2xl border border-foreground/10 bg-surface p-4"
    >
      <View className="flex-row items-center justify-between gap-2">
        <AppText variant="subtitle" size={16} numberOfLines={1}>
          수집 현황
        </AppText>
        <View className="flex-row items-end">
          <AppText color="primary" size={16} style={{ fontWeight: "800" }}>
            {collected}
          </AppText>
          <AppText color="muted" size={14}>
            {" "}
            / {total}곳
          </AppText>
        </View>
      </View>

      <ProgressBar progress={toProgress(collected, total)} height={8} />
    </View>
  );
};
