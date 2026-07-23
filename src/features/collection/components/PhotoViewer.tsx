import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { formatCollectedDate } from "@/features/collection/format";
import type { DogamPhoto } from "@/features/collection/types";
import { Entypo } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Image, Modal, Pressable, View } from "react-native";

type PhotoViewerProps = {
  visible: boolean;
  photos: DogamPhoto[];
  /** 처음 보여줄 사진. 목록 안에서 앞뒤로 넘길 수 있다. */
  initialPhotoId: string | null;
  onClose: () => void;
};

export const PhotoViewer = ({
  visible,
  photos,
  initialPhotoId,
  onClose,
}: PhotoViewerProps) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const found = photos.findIndex((photo) => photo.photoId === initialPhotoId);
    setIndex(found >= 0 ? found : 0);
  }, [visible, initialPhotoId, photos]);

  const photo = photos[index];
  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/95">
        <View className="flex-row items-center justify-between px-4 pb-2 pt-14">
          <AppText color="muted" size={13}>
            {photos.length > 0 ? `${index + 1} / ${photos.length}` : ""}
          </AppText>
          <Pressable
            testID="dogam-viewer-close"
            accessibilityRole="button"
            accessibilityLabel="사진 닫기"
            className="h-10 w-10 items-center justify-center rounded-full bg-surface"
            onPress={onClose}
          >
            <Entypo name="cross" size={22} color={colors.foreground} />
          </Pressable>
        </View>

        <Pressable
          testID="dogam-viewer-backdrop"
          accessibilityRole="button"
          accessibilityLabel="사진 닫기"
          className="flex-1 justify-center"
          onPress={onClose}
        >
          {photo ? (
            <Image
              testID={`dogam-viewer-image-${photo.photoId}`}
              source={{ uri: photo.imageUrl }}
              className="h-full w-full"
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          ) : null}
        </Pressable>

        {photo ? (
          <View className="gap-3 px-5 pb-12 pt-3">
            <View className="flex-row items-center gap-1.5">
              <Entypo name="location-pin" size={14} color={colors.primary} />
              <AppText size={14} numberOfLines={1} style={{ flex: 1 }}>
                {photo.placeName}
              </AppText>
              <AppText color="muted" size={13}>
                {formatCollectedDate(photo.verifiedAt)}
              </AppText>
            </View>

            {photos.length > 1 ? (
              <View className="flex-row items-center justify-between">
                <Pressable
                  testID="dogam-viewer-prev"
                  accessibilityRole="button"
                  accessibilityLabel="이전 사진"
                  accessibilityState={{ disabled: !hasPrev }}
                  disabled={!hasPrev}
                  className="flex-row items-center gap-1 rounded-full bg-surface px-4 py-2.5"
                  style={{ opacity: hasPrev ? 1 : 0.4 }}
                  onPress={() => setIndex((current) => current - 1)}
                >
                  <Entypo
                    name="chevron-left"
                    size={16}
                    color={colors.foreground}
                  />
                  <AppText size={13}>이전</AppText>
                </Pressable>

                <Pressable
                  testID="dogam-viewer-next"
                  accessibilityRole="button"
                  accessibilityLabel="다음 사진"
                  accessibilityState={{ disabled: !hasNext }}
                  disabled={!hasNext}
                  className="flex-row items-center gap-1 rounded-full bg-surface px-4 py-2.5"
                  style={{ opacity: hasNext ? 1 : 0.4 }}
                  onPress={() => setIndex((current) => current + 1)}
                >
                  <AppText size={13}>다음</AppText>
                  <Entypo
                    name="chevron-right"
                    size={16}
                    color={colors.foreground}
                  />
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </Modal>
  );
};
