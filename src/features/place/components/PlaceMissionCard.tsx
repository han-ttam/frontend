import { AppText } from "@/components/AppText";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { colors } from "@/constants/colors";
import { getMissionText } from "@/features/place/format";
import { Entypo } from "@expo/vector-icons";
import { Image, View } from "react-native";

type PlaceMissionCardProps = {
  mission: string | null;
  imageUrl: string | null;
  thumbSize: number;
};

const BRACKET_LENGTH = 12;
const BRACKET_WIDTH = 2;

/** 인증 미션 썸네일의 네 귀퉁이 조준선. */
const CornerBracket = ({
  vertical,
  horizontal,
}: {
  vertical: "top" | "bottom";
  horizontal: "left" | "right";
}) => {
  const isTop = vertical === "top";
  const isLeft = horizontal === "left";

  return (
    <View
      style={{
        position: "absolute",
        top: isTop ? -4 : undefined,
        bottom: isTop ? undefined : -4,
        left: isLeft ? -4 : undefined,
        right: isLeft ? undefined : -4,
        width: BRACKET_LENGTH,
        height: BRACKET_LENGTH,
        borderColor: colors.primary,
        borderTopWidth: isTop ? BRACKET_WIDTH : 0,
        borderBottomWidth: isTop ? 0 : BRACKET_WIDTH,
        borderLeftWidth: isLeft ? BRACKET_WIDTH : 0,
        borderRightWidth: isLeft ? 0 : BRACKET_WIDTH,
      }}
    />
  );
};

export const PlaceMissionCard = ({
  mission,
  imageUrl,
  thumbSize,
}: PlaceMissionCardProps) => {
  return (
    <View className="flex-row items-center gap-3 rounded-[20px] border border-primary/30 bg-primary/5 p-4">
      <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/15">
        <Entypo name="camera" size={22} color={colors.primary} />
      </View>

      <View className="flex-1 gap-1">
        <AppText color="primary" style={{ fontWeight: "800" }}>
          여행 인증 미션
        </AppText>
        <AppText color="muted" size={13} style={{ lineHeight: 19 }}>
          {getMissionText(mission)}
        </AppText>
      </View>

      <View style={{ width: thumbSize, height: thumbSize }}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="rounded-lg"
            style={{ width: thumbSize, height: thumbSize }}
            resizeMode="cover"
          />
        ) : (
          <ImagePlaceholder
            compact
            label="준비중"
            className="rounded-lg"
            style={{ width: thumbSize, height: thumbSize }}
          />
        )}
        <CornerBracket vertical="top" horizontal="left" />
        <CornerBracket vertical="top" horizontal="right" />
        <CornerBracket vertical="bottom" horizontal="left" />
        <CornerBracket vertical="bottom" horizontal="right" />
      </View>
    </View>
  );
};
