import { AppText } from "@/components/AppText";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { colors } from "@/constants/colors";
import { formatCollectedDate } from "@/features/collection/format";
import type { DogamPhoto } from "@/features/collection/types";
import { useCollectionLayout } from "@/features/collection/useCollectionLayout";
import { Entypo } from "@expo/vector-icons";
import { Image, View } from "react-native";

type RepresentativeHeroProps = {
  /** 현재 대표로 지정된 사진. 없으면 폴백 이미지를 쓴다. */
  photo: DogamPhoto | null;
  /** 대표 지정 전에 보여줄 이미지 (도 카드의 기본 사진 등). */
  fallbackImageUrl?: string | null;
  /** 사진의 장소명을 함께 보여줄지. 도 상세처럼 여러 관광지가 섞이는 곳에서 켠다. */
  showPlaceName?: boolean;
  testID?: string;
};

/** 제목 위에서 현재 대표 사진이 무엇인지 보여준다. */
export const RepresentativeHero = ({
  photo,
  fallbackImageUrl = null,
  showPlaceName = false,
  testID = "dogam-hero",
}: RepresentativeHeroProps) => {
  const { heroHeight } = useCollectionLayout();
  const imageUrl = photo?.imageUrl ?? fallbackImageUrl;

  return (
    <View
      testID={testID}
      className="overflow-hidden rounded-2xl border border-foreground/10 bg-surface"
      style={{ height: heroHeight }}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="h-full w-full"
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <ImagePlaceholder className="h-full w-full" />
      )}

      {photo ? (
        <>
          <View className="absolute left-3 top-3 flex-row items-center gap-1 rounded-full bg-primary px-2.5 py-1">
            <Entypo name="check" size={11} color={colors.background} />
            <AppText
              size={11}
              style={{ fontWeight: "800", color: colors.background }}
            >
              대표 사진
            </AppText>
          </View>

          <View className="absolute bottom-0 left-0 right-0 flex-row items-center gap-1.5 bg-black/55 px-4 py-2.5">
            {showPlaceName ? (
              <>
                <Entypo name="location-pin" size={13} color={colors.primary} />
                <AppText size={12} numberOfLines={1} style={{ flex: 1 }}>
                  {photo.placeName}
                </AppText>
              </>
            ) : (
              <View className="flex-1" />
            )}
            <AppText color="muted" size={12}>
              {formatCollectedDate(photo.verifiedAt)}
            </AppText>
          </View>
        </>
      ) : null}
    </View>
  );
};
