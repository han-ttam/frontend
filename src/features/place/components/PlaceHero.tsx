import { AppText } from "@/components/AppText";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { colors } from "@/constants/colors";
import type { PlaceVisitStatus } from "@/lib/api/placeDetail";
import { Entypo } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PlaceHeroProps = {
  imageUrl: string | null;
  height: number;
  visitStatus: PlaceVisitStatus;
  onBack: () => void;
};

export const PlaceHero = ({
  imageUrl,
  height,
  visitStatus,
  onBack,
}: PlaceHeroProps) => {
  const isVisited = visitStatus === "VISITED";

  // 히어로는 화면 맨 위라 그 위에 얹은 버튼이 상태바·노치와 겹친다.
  // 이미지는 그대로 꽉 채우고 버튼만 안전영역 아래로 내린다.
  const insets = useSafeAreaInsets();
  const controlsTop = insets.top + 16;

  return (
    <View style={{ height }}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: "100%", height }}
          resizeMode="cover"
        />
      ) : (
        <ImagePlaceholder
          label="이미지가 없어요"
          style={{ width: "100%", height }}
        />
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
        className="h-11 w-11 items-center justify-center rounded-full bg-background/70"
        style={{ position: "absolute", top: controlsTop, left: 16 }}
        onPress={onBack}
      >
        <Entypo name="chevron-left" size={24} color={colors.foreground} />
      </Pressable>

      <View
        className="flex-row items-center gap-1.5 rounded-full bg-background/70 px-4 py-2.5"
        style={{ position: "absolute", top: controlsTop, right: 16 }}
      >
        <Entypo
          name={isVisited ? "check" : "location-pin"}
          size={16}
          color={isVisited ? colors.primary : colors.foreground}
        />
        <AppText
          color={isVisited ? "primary" : "foreground"}
          size={13}
          style={{ fontWeight: "700" }}
        >
          {isVisited ? "방문 완료" : "미방문"}
        </AppText>
      </View>
    </View>
  );
};
