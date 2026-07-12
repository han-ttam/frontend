import { AppText } from "@/components/AppText";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { KoreaMap } from "@/components/KoreaMap";
import { colors } from "@/constants/colors";
import {
  regionDetails,
  type RegionDetail,
  type RegionSpotStatus,
} from "@/constants/regionDetails";
import { getRegionApiCode } from "@/constants/regionCodes";
import type { RegionId } from "@/constants/regions";
import { useRegionDetailData } from "@/features/map/useRegionDetailData";
import type {
  RegionPlaceDto,
  RegionPlacesStatusParam,
} from "@/lib/api/regionDetail";
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
  { id: "all", label: "전체", apiStatus: "ALL" },
  { id: "completed", label: "방문 완료", apiStatus: "VISITED" },
  { id: "planned", label: "방문 예정", apiStatus: "ALL" },
] as const;

type SpotFilter = (typeof FILTERS)[number]["id"];

const statusLabel: Record<RegionSpotStatus, string> = {
  completed: "방문 완료",
  planned: "방문 예정",
};

const toRegionSpotStatus = (
  status: RegionPlaceDto["visitStatus"],
): RegionSpotStatus => {
  return status === "VISITED" ? "completed" : "planned";
};

const getFilterApiStatus = (
  filter: SpotFilter,
): RegionPlacesStatusParam => {
  return FILTERS.find((item) => item.id === filter)?.apiStatus ?? "ALL";
};

const emptySpotMessage: Record<SpotFilter, string> = {
  all: "표시할 여행지가 아직 없어요.",
  completed: "방문 완료한 여행지가 아직 없어요.",
  planned: "방문 예정 여행지가 아직 없어요.",
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
  const staticDetail = id ? regionDetails[id as RegionId] : undefined;
  const [filter, setFilter] = useState<SpotFilter>("all");
  const apiCode = id ? getRegionApiCode(id) : undefined;
  const { data, isLoadingMore, loadMore } = useRegionDetailData(
    apiCode,
    getFilterApiStatus(filter),
  );
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 430);
  const isCompact = contentWidth < 390;
  const ringSize = isCompact ? 84 : 96;
  const titleSize = isCompact ? 40 : 44;
  const mapWidth = isCompact ? 74 : 88;
  const thumbnailWidth = isCompact ? 64 : 78;

  const detail = useMemo<RegionDetail | undefined>(() => {
    if (!staticDetail) {
      return undefined;
    }

    const apiDetail = data?.detail;
    const apiPlaces = data?.places;
    const apiRecommendation = data?.recommended[0];

    if (!apiDetail && !apiPlaces && !apiRecommendation) {
      return staticDetail;
    }

    return {
      ...staticDetail,
      title: staticDetail.title,
      subtitle: apiDetail?.description ?? staticDetail.subtitle,
      totalCount: apiDetail?.progress.total ?? staticDetail.totalCount,
      completedCount:
        apiDetail?.progress.collected ?? staticDetail.completedCount,
      recommendation: apiRecommendation
        ? {
            id: apiRecommendation.placeId,
            title: apiRecommendation.name,
            address: apiRecommendation.address,
            imageUrl: apiRecommendation.imageUrl,
            status: "planned",
          }
        : staticDetail.recommendation,
      spots:
        apiPlaces?.items.map((place) => {
          return {
            id: place.placeId,
            title: place.name,
            address: place.address,
            imageUrl: place.imageUrl,
            status: toRegionSpotStatus(place.visitStatus),
          };
        }) ?? staticDetail.spots,
    };
  }, [data, staticDetail]);

  const recommendation = useMemo(() => {
    if (!staticDetail) {
      return undefined;
    }

    const apiRecommendation = data?.recommended[0];

    if (!apiRecommendation) {
      return staticDetail.recommendation;
    }

    return {
      id: apiRecommendation.placeId,
      title: apiRecommendation.name,
      address: apiRecommendation.address,
      imageUrl: apiRecommendation.imageUrl,
      status: "planned" as const,
    };
  }, [data?.recommended, staticDetail]);

  const visibleSpots = useMemo(() => {
    if (!detail) {
      return [];
    }

    if (filter === "all") {
      return detail.spots;
    }

    return detail.spots.filter((spot) => spot.status === filter);
  }, [detail, filter]);
  const counts = data?.places.counts;
  const plannedCountFromCounts =
    counts == null ? undefined : Math.max(0, counts.all - counts.visited);
  const hasMoreSpots = Boolean(data?.places.nextCursor);

  const handleScroll = ({
    nativeEvent,
  }: {
    nativeEvent: {
      contentOffset: { y: number };
      contentSize: { height: number };
      layoutMeasurement: { height: number };
    };
  }) => {
    const distanceFromBottom =
      nativeEvent.contentSize.height -
      (nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height);

    if (distanceFromBottom < 280) {
      loadMore();
    }
  };

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

  const collectedCount = data?.detail.progress.collected ?? 0;
  const totalCount = data?.detail.progress.total ?? 0;
  const progress =
    data?.detail.progress.percent != null
      ? data.detail.progress.percent / 100
      : 0;
  const plannedCount = data?.detail.progress.remaining ?? totalCount;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={handleScroll}
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
                {collectedCount}
              </AppText>
              <AppText color="muted" style={{ fontSize: 16, lineHeight: 28 }}>
                / {totalCount}곳
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

        {recommendation ? (
          <View className="gap-4">
            <AppText variant="title">다음 추천 여행지</AppText>
            <View
              className={[
                "gap-4 rounded-[22px] border border-foreground/15 bg-surface/80 p-4",
                isCompact ? "" : "flex-row",
              ].join(" ")}
            >
              {recommendation.imageUrl ? (
                <Image
                  source={{ uri: recommendation.imageUrl }}
                  className="rounded-xl"
                  style={{
                    width: isCompact ? "100%" : 132,
                    height: isCompact ? 150 : 116,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <ImagePlaceholder
                  className="rounded-xl border border-foreground/10"
                  style={{
                    width: isCompact ? "100%" : 132,
                    height: isCompact ? 150 : 116,
                  }}
                />
              )}
              <View className="flex-1 justify-center gap-3">
                <View className="flex-row items-center gap-2">
                  <Entypo name="location-pin" size={22} color={colors.primary} />
                  <AppText variant="subtitle" numberOfLines={1}>
                    {recommendation.title}
                  </AppText>
                </View>
                <AppText color="muted" style={{ fontSize: 15 }} numberOfLines={1}>
                  {recommendation.address}
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
        ) : null}

        <View className="gap-4">
          <View className="flex-row items-center gap-2">
            <Entypo name="location-pin" size={25} color={colors.primary} />
            <AppText variant="title">{detail.title} 여행지 목록</AppText>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {FILTERS.map((item) => {
              const count =
                (item.id === "planned"
                  ? plannedCountFromCounts
                  : counts?.[item.id === "completed" ? "visited" : item.id]) ??
                (item.id === "all"
                  ? totalCount
                  : detail.spots.filter((spot) => spot.status === item.id)
                      .length);
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
            {visibleSpots.length > 0 ? (
              visibleSpots.map((spot, index) => (
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
                        name={
                          spot.status === "completed"
                            ? "check"
                            : "location-pin"
                        }
                        size={21}
                        color={colors.background}
                      />
                    </View>
                  </View>
                  {spot.imageUrl ? (
                    <Image
                      source={{ uri: spot.imageUrl }}
                      className="rounded-lg"
                      style={{
                        width: thumbnailWidth,
                        height: thumbnailWidth * 0.68,
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <ImagePlaceholder
                      compact
                      label="준비중"
                      className="rounded-lg border border-foreground/10"
                      style={{
                        width: thumbnailWidth,
                        height: thumbnailWidth * 0.68,
                      }}
                    />
                  )}
                  <View className="flex-1 gap-1">
                    <AppText variant="subtitle" numberOfLines={1}>
                      {spot.title}
                    </AppText>
                    <View className="flex-row items-center gap-1">
                      <Entypo
                        name="location-pin"
                        size={15}
                        color={colors.muted}
                      />
                      <AppText color="muted" size={12} numberOfLines={1}>
                        {spot.address}
                      </AppText>
                    </View>
                  </View>
                  <View className="rounded-full bg-primary/10 px-3 py-1.5">
                    <AppText
                      color="primary"
                      size={12}
                      style={{ fontWeight: "800" }}
                    >
                      {statusLabel[spot.status]}
                    </AppText>
                  </View>
                  <Entypo
                    name="chevron-right"
                    size={22}
                    color={colors.foreground}
                  />
                </Pressable>
              ))
            ) : (
              <View className="items-center gap-2 px-5 py-8">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Entypo
                    name="location-pin"
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <AppText color="muted">{emptySpotMessage[filter]}</AppText>
              </View>
            )}
            {visibleSpots.length > 0 && (isLoadingMore || hasMoreSpots) ? (
              <View className="items-center border-t border-foreground/10 px-5 py-4">
                <AppText color="muted">
                  {isLoadingMore
                    ? "여행지를 더 불러오는 중이에요"
                    : "아래로 스크롤하면 더 불러와요"}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
