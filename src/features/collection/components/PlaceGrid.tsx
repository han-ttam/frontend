import { AppText } from "@/components/AppText";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { colors } from "@/constants/colors";
import type { DogamPhoto, DogamPlace } from "@/features/collection/types";
import { useCollectionLayout } from "@/features/collection/useCollectionLayout";
import { Entypo } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";

type PlaceGridProps = {
  places: DogamPlace[];
  photoById: Record<string, DogamPhoto>;
  /** 도 대표 사진. "대표" 배지를 어느 카드에 켤지 계산하는 데 쓴다. */
  regionRepresentativePhotoId: string | null;
  onSelectPlace: (place: DogamPlace) => void;
};

const PlaceCard = ({
  place,
  coverUrl,
  isRegionRepresentative,
  onPress,
}: {
  place: DogamPlace;
  coverUrl: string | null;
  isRegionRepresentative: boolean;
  onPress: () => void;
}) => {
  const { placeCardWidth, placeImageHeight, isCompact } = useCollectionLayout();

  return (
    <Pressable
      testID={`dogam-place-${place.placeId}`}
      accessibilityRole="button"
      accessibilityLabel={`${place.name} 인증 사진 ${place.photoCount}장`}
      className="overflow-hidden rounded-2xl border border-foreground/10 bg-surface"
      style={{ width: placeCardWidth }}
      onPress={onPress}
    >
      <View style={{ height: placeImageHeight }}>
        {coverUrl ? (
          <Image
            source={{ uri: coverUrl }}
            className="h-full w-full"
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <ImagePlaceholder compact className="h-full w-full" />
        )}

        {isRegionRepresentative ? (
          <View
            testID={`dogam-place-badge-${place.placeId}`}
            className="absolute left-2 top-2 rounded-full bg-primary px-2.5 py-1"
          >
            <AppText
              size={11}
              style={{ fontWeight: "800", color: colors.background }}
            >
              대표
            </AppText>
          </View>
        ) : null}
      </View>

      <View className="gap-1 px-3 py-2.5">
        <AppText
          testID={`dogam-place-name-${place.placeId}`}
          size={isCompact ? 14 : 15}
          numberOfLines={1}
          style={{ fontWeight: "700" }}
        >
          {place.name}
        </AppText>
        <View className="flex-row items-center gap-1.5">
          <Entypo name="camera" size={12} color={colors.muted} />
          <AppText color="muted" size={12} numberOfLines={1}>
            {place.photoCount}장
          </AppText>
        </View>
      </View>
    </Pressable>
  );
};

export const PlaceGrid = ({
  places,
  photoById,
  regionRepresentativePhotoId,
  onSelectPlace,
}: PlaceGridProps) => {
  const { gridGap } = useCollectionLayout();

  if (places.length === 0) {
    return (
      <View className="items-center gap-2 rounded-2xl border border-foreground/10 bg-surface px-5 py-8">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Entypo name="camera" size={20} color={colors.primary} />
        </View>
        <AppText color="muted">아직 이 지역에서 인증한 사진이 없어요.</AppText>
      </View>
    );
  }

  // "대표" 배지는 저장 필드가 아니라 파생값이다 (불변식 I5).
  const representativePlaceId = regionRepresentativePhotoId
    ? (photoById[regionRepresentativePhotoId]?.placeId ?? null)
    : null;

  return (
    <View className="flex-row flex-wrap" style={{ gap: gridGap }}>
      {places.map((place) => {
        const coverPhoto = place.representativePhotoId
          ? photoById[place.representativePhotoId]
          : undefined;

        return (
          <PlaceCard
            key={place.placeId}
            place={place}
            coverUrl={coverPhoto?.imageUrl ?? null}
            isRegionRepresentative={representativePlaceId === place.placeId}
            onPress={() => onSelectPlace(place)}
          />
        );
      })}
    </View>
  );
};
