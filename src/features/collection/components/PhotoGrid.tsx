import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import type { DogamPhoto } from "@/features/collection/types";
import { useCollectionLayout } from "@/features/collection/useCollectionLayout";
import { Entypo } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";

type PhotoGridProps = {
  photos: DogamPhoto[];
  representativePhotoId: string | null;
  /** 탭하면 확대 보기를 연다. 대표 지정은 헤더의 "대표 사진 변경"에서 한다. */
  onOpenPhoto: (photo: DogamPhoto) => void;
};

export const PhotoGrid = ({
  photos,
  representativePhotoId,
  onOpenPhoto,
}: PhotoGridProps) => {
  const { photoCellSize, photoGridGap } = useCollectionLayout();

  if (photos.length === 0) {
    return (
      <View className="items-center gap-2 rounded-2xl border border-foreground/10 bg-surface px-5 py-8">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Entypo name="camera" size={20} color={colors.primary} />
        </View>
        <AppText color="muted">아직 이 여행지에서 인증한 사진이 없어요.</AppText>
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap" style={{ gap: photoGridGap }}>
      {photos.map((photo) => {
        const isRepresentative = photo.photoId === representativePhotoId;

        return (
          <Pressable
            key={photo.photoId}
            testID={`dogam-photo-${photo.photoId}`}
            accessibilityRole="imagebutton"
            accessibilityLabel={
              isRepresentative
                ? `${photo.placeName} 대표 사진, 탭하면 확대`
                : `${photo.placeName} 사진, 탭하면 확대`
            }
            className={[
              "overflow-hidden rounded-2xl bg-surface",
              isRepresentative ? "border-2 border-primary" : "",
            ].join(" ")}
            style={{ width: photoCellSize, height: photoCellSize }}
            onPress={() => onOpenPhoto(photo)}
          >
            <Image
              source={{ uri: photo.imageUrl }}
              className="h-full w-full"
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />

            {isRepresentative ? (
              <View
                testID={`dogam-photo-badge-${photo.photoId}`}
                className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5"
              >
                <AppText
                  size={10}
                  style={{ fontWeight: "800", color: colors.background }}
                >
                  대표
                </AppText>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
};
