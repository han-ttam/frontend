import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { PlaceGrid } from "@/features/collection/components/PlaceGrid";
import { ProgressBar } from "@/features/collection/components/ProgressBar";
import { RepresentativeHero } from "@/features/collection/components/RepresentativeHero";
import { RepresentativePickerSheet } from "@/features/collection/components/RepresentativePickerSheet";
import { SortChips } from "@/features/collection/components/SortChips";
import { toProgress } from "@/features/collection/format";
import { sortPlaces } from "@/features/collection/sortPlaces";
import type { DogamPlace, PlaceSort } from "@/features/collection/types";
import { useCollectionLayout } from "@/features/collection/useCollectionLayout";
import { useDogamRegionDetail } from "@/features/collection/useDogamRegionDetail";
import { Entypo } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

const DogamRegionDetailPage = () => {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [sort, setSort] = useState<PlaceSort>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const { maxContentWidth, horizontalPadding, isCompact } =
    useCollectionLayout();
  const {
    data,
    photoById,
    regionPhotos,
    isLoading,
    error,
    setRegionRepresentative,
  } = useDogamRegionDetail(code);

  const places = useMemo(
    () => sortPlaces(data?.places ?? [], sort),
    [data?.places, sort],
  );

  const openPlacePhotos = (place: DogamPlace) => {
    router.push({
      pathname: "/collection/place/[id]",
      params: { id: place.placeId },
    });
  };

  const backButton = (
    <Pressable
      testID="dogam-region-back"
      accessibilityRole="button"
      accessibilityLabel="도감으로 돌아가기"
      className="-ml-1 flex-row items-center gap-0.5 self-start py-1 pr-3"
      onPress={() => router.back()}
    >
      <Entypo name="chevron-left" size={20} color={colors.muted} />
      <AppText color="muted" size={14}>
        도감
      </AppText>
    </Pressable>
  );

  const frame = (children: React.ReactNode) => (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View
        className="gap-5 pb-10 pt-5"
        style={{
          width: "100%",
          maxWidth: maxContentWidth,
          alignSelf: "center",
          paddingHorizontal: horizontalPadding,
        }}
      >
        {children}
      </View>
    </ScrollView>
  );

  if (isLoading) {
    return frame(
      <>
        {backButton}
        <View className="items-center py-16">
          <ActivityIndicator color={colors.primary} />
        </View>
      </>,
    );
  }

  if (error || !data) {
    return frame(
      <>
        {backButton}
        <View className="items-center gap-2 rounded-2xl border border-foreground/10 bg-surface px-5 py-8">
          <AppText color="muted">지역 정보를 불러오지 못했어요.</AppText>
        </View>
      </>,
    );
  }

  const { region, photoTotal } = data;

  return frame(
    <>
      {backButton}

      {/*
        지금 이 도의 대표 사진이 무엇인지 제목 위에서 바로 보여준다.
        도 전체 사진이 후보라 어느 관광지에서 찍힌 것인지도 함께 표시한다.
      */}
      <RepresentativeHero
        photo={
          region.representativePhotoId
            ? (photoById[region.representativePhotoId] ?? null)
            : null
        }
        fallbackImageUrl={region.imageUrl}
        showPlaceName
      />

      <View className="gap-2.5">
        <View className="flex-row items-end justify-between gap-3">
          <AppText variant="title" size={isCompact ? 24 : 26}>
            {region.name}
          </AppText>
          <View className="flex-row items-baseline">
            <AppText color="primary" size={17} style={{ fontWeight: "800" }}>
              {region.collected}
            </AppText>
            <AppText color="muted" size={14}>
              /{region.total}곳
            </AppText>
          </View>
        </View>

        <ProgressBar progress={toProgress(region.collected, region.total)} />

        <View className="flex-row items-center justify-between gap-3">
          <AppText color="muted" size={13}>
            내가 담은 {region.name} · 사진 {photoTotal}장
          </AppText>

          {/*
            시안 2c 에는 이 버튼이 없다. 시안 4c 설명이 `"변경" → …` 으로 시작해
            지역 상세에서의 진입을 전제하므로 헤더에 진입점을 두었다.
            디자인 확인이 필요한 부분.
          */}
          {regionPhotos.length > 0 ? (
            <Pressable
              testID="dogam-rep-open"
              accessibilityRole="button"
              accessibilityLabel={`${region.name} 대표 사진 변경`}
              className="rounded-full bg-surface px-3 py-1.5"
              onPress={() => setSheetOpen(true)}
            >
              <AppText color="primary" size={12} style={{ fontWeight: "700" }}>
                대표 사진 변경
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </View>

      <SortChips
        sort={sort}
        totalCount={data.places.length}
        onChangeSort={setSort}
      />

      <PlaceGrid
        places={places}
        photoById={photoById}
        regionRepresentativePhotoId={region.representativePhotoId ?? null}
        onSelectPlace={openPlacePhotos}
      />

      <RepresentativePickerSheet
        visible={sheetOpen}
        scopeName={region.name}
        photos={regionPhotos}
        currentPhotoId={region.representativePhotoId ?? null}
        onCancel={() => setSheetOpen(false)}
        onConfirm={(photoId) => {
          setRegionRepresentative(photoId);
          setSheetOpen(false);
        }}
      />
    </>,
  );
};

export default DogamRegionDetailPage;
