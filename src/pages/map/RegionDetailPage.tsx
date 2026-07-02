import { AppText } from "@/components/AppText";
import { KoreaMap } from "@/components/KoreaMap";
import { colors } from "@/constants/colors";
import { regionDetails, type RegionSpotStatus } from "@/constants/regionDetails";
import type { RegionId } from "@/constants/regions";
import { Entypo } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

const FILTERS = [
  { id: "all", label: "전체" },
  { id: "completed", label: "방문 완료" },
  { id: "planned", label: "방문 예정" },
] as const;

type SpotFilter = (typeof FILTERS)[number]["id"];

const statusLabel: Record<RegionSpotStatus, string> = {
  completed: "방문 완료",
  planned: "방문 예정",
};

const ProgressRing = ({
  progress,
  size,
  strokeWidth,
}: {
  progress: number;
  size: number;
  strokeWidth: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <View className="items-center justify-center">
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
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View className="absolute flex-row items-end">
        <AppText
          style={{
            fontSize: Math.round(size * 0.3),
            lineHeight: Math.round(size * 0.36),
            fontWeight: "800",
          }}
        >
          {Math.round(progress * 100)}
        </AppText>
        <AppText
          style={{
            fontSize: Math.round(size * 0.17),
            lineHeight: Math.round(size * 0.27),
            fontWeight: "800",
          }}
        >
          %
        </AppText>
      </View>
    </View>
  );
};

export default function RegionDetailPage() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const detail = id ? regionDetails[id as RegionId] : undefined;
  const [filter, setFilter] = useState<SpotFilter>("all");
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 430);
  const isCompact = contentWidth < 390;
  const ringSize = isCompact ? 84 : 96;
  const titleSize = isCompact ? 40 : 44;
  const mapWidth = isCompact ? 74 : 88;
  const thumbnailWidth = isCompact ? 64 : 78;

  const visibleSpots = useMemo(() => {
    if (!detail || filter === "all") {
      return detail?.spots ?? [];
    }

    return detail.spots.filter((spot) => spot.status === filter);
  }, [detail, filter]);

  if (!detail) {
    return (
      <View className="flex-1 gap-5 bg-background px-5 py-8">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          className="h-11 w-11 items-center justify-center rounded-full bg-surface"
          onPress={() => router.back()}
        >
          <Entypo name="chevron-left" size={25} color={colors.foreground} />
        </Pressable>
        <View className="gap-2">
          <AppText variant="title">지역을 찾을 수 없어요</AppText>
          <AppText color="muted">선택한 지역 정보를 불러오지 못했습니다.</AppText>
        </View>
      </View>
    );
  }

  const progress = detail.completedCount / detail.totalCount;
  const plannedCount = detail.totalCount - detail.completedCount;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View
        className="gap-6 px-5 pb-10 pt-5"
        style={{ width: "100%", maxWidth: 430, alignSelf: "center" }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          className="h-12 w-12 items-center justify-center rounded-full bg-surface"
          onPress={() => router.back()}
        >
          <Entypo name="chevron-left" size={28} color={colors.foreground} />
        </Pressable>

        <View className="gap-3">
          <AppText
            style={{ fontSize: titleSize, lineHeight: titleSize + 10, fontWeight: "800" }}
          >
            {detail.title}
          </AppText>
          <AppText color="muted" style={{ fontSize: 16, lineHeight: 24 }}>
            {detail.subtitle}
          </AppText>
        </View>

        <View className="flex-row items-center gap-3 overflow-hidden rounded-[22px] border border-foreground/15 bg-surface/80 p-4">
          <ProgressRing
            progress={progress}
            size={ringSize}
            strokeWidth={isCompact ? 9 : 10}
          />
          <View className="flex-1 gap-3">
            <AppText color="muted" style={{ fontSize: 16, fontWeight: "700" }}>
              수집 현황
            </AppText>
            <View className="flex-row items-end gap-2">
              <AppText
                color="primary"
                style={{
                  fontSize: isCompact ? 32 : 36,
                  lineHeight: isCompact ? 38 : 42,
                  fontWeight: "800",
                }}
              >
                {detail.completedCount}
              </AppText>
              <AppText color="muted" style={{ fontSize: 16, lineHeight: 28 }}>
                / {detail.totalCount}곳
              </AppText>
            </View>
            <View className="h-2.5 overflow-hidden rounded-full bg-foreground/10">
              <View
                className="h-full rounded-full bg-primary"
                style={{ width: `${progress * 100}%` }}
              />
            </View>
            <AppText color="muted">
              {detail.title} 명소를{" "}
              <AppText color="primary" style={{ fontWeight: "800" }}>
                {plannedCount}곳
              </AppText>{" "}
              더 방문해보세요!
            </AppText>
          </View>
          <View style={{ width: mapWidth, height: mapWidth * 1.28 }}>
            <KoreaMap
              defaultFill="#25282A"
              strokeColor="#111313"
              selectedRegionId={detail.id}
              regionColors={Object.fromEntries(
                detail.accentRegionIds.map((regionId) => [
                  regionId,
                  colors.primary,
                ]),
              )}
            />
          </View>
        </View>

        <View className="gap-4">
          <AppText variant="title">다음 추천 여행지</AppText>
          <View
            className={[
              "gap-4 rounded-[22px] border border-foreground/15 bg-surface/80 p-4",
              isCompact ? "" : "flex-row",
            ].join(" ")}
          >
            <Image
              source={{ uri: detail.recommendation.imageUrl }}
              className="rounded-xl"
              style={{
                width: isCompact ? "100%" : 132,
                height: isCompact ? 150 : 116,
              }}
              resizeMode="cover"
            />
            <View className="flex-1 justify-center gap-3">
              <View className="flex-row items-center gap-2">
                <Entypo name="location-pin" size={22} color={colors.primary} />
                <AppText variant="subtitle" numberOfLines={1}>
                  {detail.recommendation.title}
                </AppText>
              </View>
              <AppText color="muted" style={{ fontSize: 15 }} numberOfLines={1}>
                {detail.recommendation.address}
              </AppText>
              <AppText color="muted">
                푸른 동해 바다와 절경을 함께 즐길 수 있는 전망 명소!
              </AppText>
              <View className="self-start rounded-full border border-primary px-4 py-1.5">
                <AppText color="primary" style={{ fontWeight: "800" }}>
                  방문 예정
                </AppText>
              </View>
            </View>
          </View>
        </View>

        <View className="gap-4">
          <View className="flex-row items-center gap-2">
            <Entypo name="location-pin" size={25} color={colors.primary} />
            <AppText variant="title">{detail.title} 여행지 목록</AppText>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {FILTERS.map((item) => {
              const count =
                item.id === "all"
                  ? detail.totalCount
                  : detail.spots.filter((spot) => spot.status === item.id)
                      .length;
              const isSelected = filter === item.id;

              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.label} 보기`}
                  className={[
                    "rounded-full border px-4 py-2.5",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-foreground/15 bg-surface",
                  ].join(" ")}
                  onPress={() => setFilter(item.id)}
                >
                  <AppText color={isSelected ? "primary" : "muted"}>
                    {item.label} ({count})
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <View className="overflow-hidden rounded-[24px] border border-foreground/15 bg-surface/80">
            {visibleSpots.map((spot, index) => (
              <Pressable
                key={spot.id}
                accessibilityRole="button"
                accessibilityLabel={`${spot.title} 상세 보기`}
                className={[
                  "flex-row items-center gap-3 px-4 py-3",
                  index > 0 ? "border-t border-foreground/10" : "",
                ].join(" ")}
              >
                <View className="h-9 w-9 items-center justify-center">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <Entypo
                      name={spot.status === "completed" ? "check" : "location-pin"}
                      size={21}
                      color={colors.background}
                    />
                  </View>
                </View>
                <Image
                  source={{ uri: spot.imageUrl }}
                  className="rounded-lg"
                  style={{ width: thumbnailWidth, height: thumbnailWidth * 0.68 }}
                  resizeMode="cover"
                />
                <View className="flex-1 gap-1">
                  <AppText variant="subtitle" numberOfLines={1}>
                    {spot.title}
                  </AppText>
                  <View className="flex-row items-center gap-1">
                    <Entypo name="location-pin" size={15} color={colors.muted} />
                    <AppText color="muted" size={12} numberOfLines={1}>
                      {spot.address}
                    </AppText>
                  </View>
                </View>
                <View className="rounded-full bg-primary/10 px-3 py-1.5">
                  <AppText color="primary" size={12} style={{ fontWeight: "800" }}>
                    {statusLabel[spot.status]}
                  </AppText>
                </View>
                <Entypo name="chevron-right" size={22} color={colors.foreground} />
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
