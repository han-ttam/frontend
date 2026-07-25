import { AppText } from "@/components/AppText";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { colors } from "@/constants/colors";
import type { CollectionPlace } from "@/features/mypage/types";
import { useMypageLayout } from "@/features/mypage/useMypageLayout";
import { Entypo } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";

type CollectionPlaceRowProps = {
  place: CollectionPlace;
  onPress: () => void;
};

export const CollectionPlaceRow = ({
  place,
  onPress,
}: CollectionPlaceRowProps) => {
  const { rowThumbSize, checkSize, rowGap, isCompact } = useMypageLayout();
  const isCollected = place.visitStatus === "VISITED";
  const thumbStyle = { width: rowThumbSize, height: rowThumbSize };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${place.name}, ${isCollected ? "수집함" : "미수집"}`}
      className="flex-row items-center rounded-2xl border border-foreground/10 bg-surface p-3"
      style={{ gap: rowGap }}
      onPress={onPress}
    >
      {isCollected ? (
        <View
          className="items-center justify-center rounded-full bg-primary"
          style={{ width: checkSize, height: checkSize }}
        >
          <Entypo name="check" size={checkSize - 12} color={colors.background} />
        </View>
      ) : (
        <View
          className="rounded-full border border-foreground/25"
          style={{ width: checkSize, height: checkSize }}
        />
      )}

      <View className={isCollected ? undefined : "opacity-40"}>
        {place.imageUrl ? (
          <Image
            source={{ uri: place.imageUrl }}
            className="rounded-xl border border-foreground/10"
            style={thumbStyle}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <ImagePlaceholder
            compact
            className="rounded-xl border border-foreground/10"
            style={thumbStyle}
          />
        )}
      </View>

      <View className={["flex-1 gap-1", isCollected ? "" : "opacity-60"].join(" ")}>
        <AppText variant="subtitle" size={isCompact ? 15 : 16} numberOfLines={1}>
          {place.name}
        </AppText>
        {place.address ? (
          <AppText color="muted" size={isCompact ? 12 : 13} numberOfLines={1}>
            {place.address}
          </AppText>
        ) : null}
      </View>

      {isCollected ? null : (
        <View className="rounded-full bg-foreground/10 px-2.5 py-1">
          <AppText color="muted" size={12} style={{ fontWeight: "700" }}>
            미수집
          </AppText>
        </View>
      )}
    </Pressable>
  );
};
