import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { BookmarkButton } from "@/features/place/components/BookmarkButton";
import { CertificationGallery } from "@/features/place/components/CertificationGallery";
import { CompositionGuide } from "@/features/place/components/CompositionGuide";
import { PlaceHero } from "@/features/place/components/PlaceHero";
import { PlaceMissionCard } from "@/features/place/components/PlaceMissionCard";
import { PlaceScoreCard } from "@/features/place/components/PlaceScoreCard";
import { formatTag } from "@/features/place/format";
import { useBookmark } from "@/features/place/useBookmark";
import { usePlaceDetailData } from "@/features/place/usePlaceDetailData";
import { usePlaceDetailLayout } from "@/features/place/usePlaceDetailLayout";
import { Entypo } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

const MessageScreen = ({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) => {
  return (
    <View className="flex-1 gap-5 bg-background px-5 py-8">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
        className="h-11 w-11 items-center justify-center rounded-full bg-surface"
        onPress={() => router.back()}
      >
        <Entypo name="chevron-left" size={24} color={colors.foreground} />
      </Pressable>
      <View className="gap-2">
        <AppText variant="title">{title}</AppText>
        <AppText color="muted">{description}</AppText>
      </View>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="다시 시도"
          className="self-start rounded-full border border-primary px-5 py-2.5"
          onPress={onRetry}
        >
          <AppText color="primary" style={{ fontWeight: "800" }}>
            다시 시도
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
};

const PlaceDetailPage = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data, error, isLoading, reload } = usePlaceDetailData(id);
  const {
    maxContentWidth,
    horizontalPadding,
    isCompact,
    heroHeight,
    titleSize,
    scoreValueSize,
    missionThumbSize,
    compositionCardWidth,
    compositionImageHeight,
    compositionGap,
    certificationThumbSize,
    certificationGap,
  } = usePlaceDetailLayout();

  // 훅 호출은 조기 반환보다 위에 있어야 렌더마다 순서가 같다.
  const {
    isAvailable: canBookmark,
    isBookmarked,
    isDisabled: isBookmarkDisabled,
    toggle: toggleBookmark,
    toggleError: bookmarkError,
    isSessionExpired: isBookmarkSessionExpired,
  } = useBookmark(id);

  if (!id) {
    return (
      <MessageScreen
        title="여행지를 찾을 수 없어요"
        description="장소 정보가 없어 상세를 열 수 없습니다."
      />
    );
  }

  if (isLoading) {
    return (
      <MessageScreen
        title="여행지를 불러오는 중이에요"
        description="잠시만 기다려주세요."
      />
    );
  }

  if (error || !data) {
    return (
      <MessageScreen
        title="여행지를 불러오지 못했어요"
        description={error?.message ?? "잠시 후 다시 시도해주세요."}
        onRetry={reload}
      />
    );
  }

  const { place, scoring, compositions, certifications } = data;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1 bg-background"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{ width: "100%", maxWidth: maxContentWidth, alignSelf: "center" }}
        >
          <PlaceHero
            imageUrl={place.imageUrl}
            height={heroHeight}
            visitStatus={place.visitStatus}
            onBack={() => router.back()}
          />

          <View
            className="gap-6 pb-10 pt-6"
            style={{ paddingHorizontal: horizontalPadding }}
          >
            <View className="gap-3">
              <View className="flex-row items-start gap-3">
                <AppText
                  style={{
                    flex: 1,
                    fontSize: titleSize,
                    lineHeight: titleSize + 8,
                    fontWeight: "800",
                  }}
                >
                  {place.name}
                </AppText>

                {canBookmark ? (
                  <BookmarkButton
                    isBookmarked={isBookmarked}
                    isDisabled={isBookmarkDisabled}
                    onPress={toggleBookmark}
                  />
                ) : null}
              </View>

              {bookmarkError ? (
                <AppText color="muted" size={13}>
                  {isBookmarkSessionExpired
                    ? "로그인이 만료됐어요. 다시 로그인해주세요."
                    : "찜을 저장하지 못했어요. 다시 시도해주세요."}
                </AppText>
              ) : null}

              <View className="flex-row items-center gap-1.5">
                <Entypo name="location-pin" size={18} color={colors.primary} />
                <AppText color="muted" size={14} style={{ flex: 1 }}>
                  {place.address}
                </AppText>
              </View>

              {place.tags.length > 0 ? (
                <View className="flex-row flex-wrap gap-2">
                  {place.tags.map((tag) => (
                    <View
                      key={tag}
                      className="rounded-full border border-foreground/15 bg-surface px-3 py-1.5"
                    >
                      <AppText color="muted" size={12}>
                        {formatTag(tag)}
                      </AppText>
                    </View>
                  ))}
                </View>
              ) : null}

              {place.description ? (
                <AppText color="muted" style={{ lineHeight: 22 }}>
                  {place.description}
                </AppText>
              ) : null}
            </View>

            <PlaceScoreCard
              scoring={scoring}
              rating={place.rating}
              ratingCount={place.ratingCount}
              valueSize={scoreValueSize}
              isCompact={isCompact}
            />

            <PlaceMissionCard
              mission={place.mission}
              imageUrl={place.imageUrl}
              thumbSize={missionThumbSize}
            />

            <CompositionGuide
              compositions={compositions}
              cardWidth={compositionCardWidth}
              imageHeight={compositionImageHeight}
              gap={compositionGap}
            />

            <CertificationGallery
              certifications={certifications.items}
              thumbSize={certificationThumbSize}
              gap={certificationGap}
            />

            <View className="gap-2">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="이 장소 인증하기"
                className="h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-primary"
                onPress={() => router.push("/photo")}
              >
                <Entypo name="camera" size={20} color={colors.background} />
                <AppText
                  size={16}
                  style={{ color: colors.background, fontWeight: "800" }}
                >
                  이 장소 인증하기
                </AppText>
              </Pressable>
              <AppText color="muted" size={12} style={{ textAlign: "center" }}>
                다른 여행자에게 도움이 되는 인증을 남겨주세요!
              </AppText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default PlaceDetailPage;
