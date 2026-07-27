import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { PhotoGrid } from "@/features/collection/components/PhotoGrid";
import { PhotoViewer } from "@/features/collection/components/PhotoViewer";
import { RepresentativeHero } from "@/features/collection/components/RepresentativeHero";
import { RepresentativePickerSheet } from "@/features/collection/components/RepresentativePickerSheet";
import { useCollectionLayout } from "@/features/collection/useCollectionLayout";
import { useDogamPlacePhotos } from "@/features/collection/useDogamPlacePhotos";
import { Entypo } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

const DogamPlacePhotosPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewerPhotoId, setViewerPhotoId] = useState<string | null>(null);
  const { maxContentWidth, horizontalPadding, isCompact } =
    useCollectionLayout();
  const { data, isLoading, error, setPlaceRepresentative } =
    useDogamPlacePhotos(id);

  const backButton = (
    <Pressable
      testID="dogam-place-back"
      accessibilityRole="button"
      accessibilityLabel="이전 화면으로 돌아가기"
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
          <AppText color="muted">여행지 정보를 불러오지 못했어요.</AppText>
        </View>
      </>,
    );
  }

  const { place, photos } = data;
  const hasPhotos = photos.length > 0;
  const representativePhoto =
    photos.find((photo) => photo.photoId === place.representativePhotoId) ??
    null;

  return frame(
    <>
      {backButton}

      {/* 지금 이 관광지의 대표 사진이 무엇인지 제목 위에서 바로 보여준다. */}
      {hasPhotos ? <RepresentativeHero photo={representativePhoto} /> : null}

      <View className="gap-1">
        <AppText variant="title" size={isCompact ? 24 : 26}>
          {place.name}
        </AppText>
        <AppText color="muted" size={13}>
          {place.address} · 내 인증 사진 {photos.length}장
        </AppText>
      </View>

      <View className="flex-row items-center justify-between gap-3">
        <AppText variant="subtitle" size={17} style={{ fontWeight: "700" }}>
          사진첩
        </AppText>

        {hasPhotos ? (
          <Pressable
            testID="dogam-rep-open"
            accessibilityRole="button"
            accessibilityLabel={`${place.name} 대표 사진 변경`}
            className="rounded-full bg-surface px-3 py-1.5"
            onPress={() => setSheetOpen(true)}
          >
            <AppText color="primary" size={12} style={{ fontWeight: "700" }}>
              대표 사진 변경
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <PhotoGrid
        photos={photos}
        representativePhotoId={place.representativePhotoId}
        onOpenPhoto={(photo) => setViewerPhotoId(photo.photoId)}
      />

      {hasPhotos ? (
        <View className="flex-row gap-3 rounded-2xl border border-foreground/10 bg-surface px-4 py-3.5">
          <Entypo name="light-bulb" size={18} color={colors.primary} />
          <View className="flex-1 gap-0.5">
            <AppText color="muted" size={13}>
              사진을 탭하면 크게 볼 수 있어요.
            </AppText>
            <AppText color="muted" size={13}>
              대표 사진은 도감 카드 표지로 보여져요.
            </AppText>
          </View>
        </View>
      ) : null}

      <PhotoViewer
        visible={viewerPhotoId !== null}
        photos={photos}
        initialPhotoId={viewerPhotoId}
        onClose={() => setViewerPhotoId(null)}
      />

      <RepresentativePickerSheet
        visible={sheetOpen}
        scopeName={place.name}
        photos={photos}
        currentPhotoId={place.representativePhotoId}
        onCancel={() => setSheetOpen(false)}
        onConfirm={(photoId) => {
          setPlaceRepresentative(photoId);
          setSheetOpen(false);
        }}
      />
    </>,
  );
};

export default DogamPlacePhotosPage;
