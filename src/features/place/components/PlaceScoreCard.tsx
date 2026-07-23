import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import {
  formatPoints,
  formatRating,
  formatWeight,
} from "@/features/place/format";
import type { PlaceScoringDto } from "@/lib/api/placeDetail";
import { Entypo, Feather } from "@expo/vector-icons";
import { View } from "react-native";

type PlaceScoreCardProps = {
  scoring: PlaceScoringDto | undefined;
  rating: number | null;
  ratingCount: number;
  valueSize: number;
  isCompact: boolean;
};

const Divider = () => {
  return <View className="h-10 w-px bg-foreground/15" />;
};

export const PlaceScoreCard = ({
  scoring,
  rating,
  ratingCount,
  valueSize,
  isCompact,
}: PlaceScoreCardProps) => {
  const items = [
    {
      key: "points",
      label: "획득 별",
      value: scoring ? String(scoring.basePoints) : "–",
      icon: <Entypo name="star-outlined" size={22} color={colors.foreground} />,
    },
    {
      key: "region",
      label: "지역 가중치",
      value: scoring ? formatWeight(scoring.regionWeight) : "–",
      icon: <Feather name="triangle" size={20} color={colors.foreground} />,
    },
    {
      key: "rating",
      label: "여행자 평점",
      value: formatRating(rating, ratingCount),
      icon: <Feather name="user" size={20} color={colors.foreground} />,
    },
  ];

  return (
    <View className="gap-2.5">
      <View className="flex-row items-center justify-between rounded-[20px] border border-foreground/15 bg-surface/80 px-2 py-4">
        {items.map((item, index) => (
          <View key={item.key} className="flex-1 flex-row items-center">
            {index > 0 ? <Divider /> : null}
            <View
              className={[
                "flex-1 items-center justify-center",
                isCompact ? "gap-1" : "flex-row gap-2",
              ].join(" ")}
            >
              {item.icon}
              <View className={isCompact ? "items-center" : "gap-0.5"}>
                <AppText color="muted" size={isCompact ? 11 : 12}>
                  {item.label}
                </AppText>
                <AppText
                  style={{
                    fontSize: valueSize,
                    lineHeight: valueSize + 6,
                    fontWeight: "800",
                  }}
                >
                  {item.value}
                </AppText>
              </View>
            </View>
          </View>
        ))}
      </View>

      <AppText color="muted" size={12} style={{ textAlign: "center" }}>
        기본 점수에 지역 가중치와 목적지 희소도 가중치가 적용돼요.
      </AppText>

      {scoring ? (
        <AppText color="primary" size={12} style={{ textAlign: "center", fontWeight: "700" }}>
          지금 인증하면 예상 {formatPoints(scoring.estimatedPoints)}점
        </AppText>
      ) : null}
    </View>
  );
};
