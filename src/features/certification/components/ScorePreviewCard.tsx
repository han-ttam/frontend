import { Text, View } from "react-native";
import type { ScorePreview } from "../types";

interface ScorePreviewCardProps {
  score: ScorePreview;
  label: string;
  note: string;
}

export function ScorePreviewCard({ score, label, note }: ScorePreviewCardProps) {
  return (
    <View
      className="flex-row items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
      accessibilityRole="summary"
      accessibilityLabel={`${label} ${score.basePoints}점, 지역 가중치 ${score.regionWeight}배 적용`}
    >
      <View className="shrink-0">
        <Text className="text-sm text-gray-400">{label}</Text>
        <Text className="mt-1 text-2xl font-bold text-emerald-400">+{score.basePoints}</Text>
      </View>
      <View className="flex-1 items-end">
        <Text className="text-right text-sm font-semibold text-white">
          지역 가중치 <Text className="text-emerald-400">×{score.regionWeight}</Text> 적용
        </Text>
        <Text className="mt-1 text-right text-xs text-gray-400">{note}</Text>
      </View>
    </View>
  );
}
