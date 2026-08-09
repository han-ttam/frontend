import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { clampProgress } from "@/features/mypage/format";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type TopPercentRingProps = {
  /** 랭킹 데이터가 없으면 null 이다. 링을 비우고 대시를 보여준다. */
  topPercent: number | null;
  size?: number;
  strokeWidth?: number;
};

export const TopPercentRing = ({
  topPercent,
  size = 96,
  strokeWidth = 10,
}: TopPercentRingProps) => {
  const progress =
    topPercent == null ? 0 : clampProgress(1 - topPercent / 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(244,245,244,0.12)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View className="absolute items-center">
        <AppText color="muted" size={11} style={{ fontWeight: "700" }}>
          상위
        </AppText>
        <View className="flex-row items-end">
          <AppText style={{ fontSize: 22, lineHeight: 28, fontWeight: "800" }}>
            {topPercent ?? "–"}
          </AppText>
          {topPercent == null ? null : (
            <AppText style={{ fontSize: 13, lineHeight: 22, fontWeight: "800" }}>
              %
            </AppText>
          )}
        </View>
      </View>
    </View>
  );
};
