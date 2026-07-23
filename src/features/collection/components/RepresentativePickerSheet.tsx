import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { formatCollectedDate } from "@/features/collection/format";
import type { DogamPhoto } from "@/features/collection/types";
import { useCollectionLayout } from "@/features/collection/useCollectionLayout";
import { Entypo } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Image, Modal, Pressable, ScrollView, View } from "react-native";

type RepresentativePickerSheetProps = {
  visible: boolean;
  /**
   * 후보 범위의 이름. 두 단계에서 재사용한다.
   * - 도(1depth): "강원도" — 후보는 그 도 모든 관광지의 사진 (FR-016a)
   * - 관광지(2depth): "속초 영금정" — 후보는 그 관광지의 사진
   */
  scopeName: string;
  photos: DogamPhoto[];
  currentPhotoId: string | null;
  onCancel: () => void;
  onConfirm: (photoId: string) => void;
};

export const RepresentativePickerSheet = ({
  visible,
  scopeName,
  photos,
  currentPhotoId,
  onCancel,
  onConfirm,
}: RepresentativePickerSheetProps) => {
  const { sheetPreviewHeight, sheetThumbSize } = useCollectionLayout();
  // 확정 전까지 대표는 바뀌지 않는다 (FR-019). 선택은 draft 에만 담아둔다.
  const [draftPhotoId, setDraftPhotoId] = useState<string | null>(
    currentPhotoId,
  );

  useEffect(() => {
    if (visible) {
      setDraftPhotoId(currentPhotoId ?? photos[0]?.photoId ?? null);
    }
  }, [visible, currentPhotoId, photos]);

  const preview =
    photos.find((photo) => photo.photoId === draftPhotoId) ?? photos[0];

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-end bg-black/70">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="대표 사진 선택 닫기"
          className="flex-1"
          onPress={onCancel}
        />

        <View
          testID="dogam-rep-sheet"
          className="gap-4 rounded-t-[28px] border border-foreground/10 bg-background px-5 pb-8 pt-3"
        >
          <View className="h-1 w-10 self-center rounded-full bg-foreground/20" />

          <View className="gap-1">
            <AppText variant="title" size={20}>
              대표 사진 선택
            </AppText>
            <AppText color="muted" size={13}>
              {scopeName}에서 인증한 사진 {photos.length}장 중에서 골라요
            </AppText>
          </View>

          {preview ? (
            <View
              className="overflow-hidden rounded-2xl bg-surface"
              style={{ height: sheetPreviewHeight }}
            >
              <Image
                source={{ uri: preview.imageUrl }}
                className="h-full w-full"
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              />
              <View className="absolute bottom-0 left-0 right-0 flex-row items-center gap-1.5 bg-black/55 px-4 py-3">
                <Entypo name="location-pin" size={14} color={colors.primary} />
                <AppText size={13} numberOfLines={1} style={{ flex: 1 }}>
                  {preview.placeName} · {formatCollectedDate(preview.verifiedAt)}
                </AppText>
              </View>
            </View>
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {photos.map((photo) => {
              const selected = photo.photoId === draftPhotoId;

              return (
                <Pressable
                  key={photo.photoId}
                  testID={`dogam-rep-thumb-${photo.photoId}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${photo.placeName} 사진`}
                  className={[
                    "overflow-hidden rounded-xl bg-surface",
                    selected ? "border-2 border-primary" : "",
                  ].join(" ")}
                  style={{ width: sheetThumbSize, height: sheetThumbSize }}
                  onPress={() => setDraftPhotoId(photo.photoId)}
                >
                  <Image
                    source={{ uri: photo.imageUrl }}
                    className="h-full w-full"
                    resizeMode="cover"
                    accessibilityIgnoresInvertColors
                  />
                </Pressable>
              );
            })}
          </ScrollView>

          <View className="flex-row items-center gap-3">
            <Pressable
              testID="dogam-rep-cancel"
              accessibilityRole="button"
              accessibilityLabel="취소"
              className="rounded-full px-5 py-3"
              onPress={onCancel}
            >
              <AppText color="muted" style={{ fontWeight: "700" }}>
                취소
              </AppText>
            </Pressable>

            <Pressable
              testID="dogam-rep-confirm"
              accessibilityRole="button"
              accessibilityLabel="대표로 지정"
              accessibilityState={{ disabled: !draftPhotoId }}
              disabled={!draftPhotoId}
              className="flex-1 items-center rounded-full bg-primary py-3.5"
              style={{ opacity: draftPhotoId ? 1 : 0.5 }}
              onPress={() => {
                if (draftPhotoId) {
                  onConfirm(draftPhotoId);
                }
              }}
            >
              <AppText
                style={{ fontWeight: "800", color: colors.background }}
              >
                대표로 지정
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
