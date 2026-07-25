import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { Entypo } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

type CollectionMessageProps = {
  title: string;
  description: string;
  onBack: () => void;
  onRetry?: () => void;
};

/**
 * 모음 상세의 안내·오류 화면.
 * 장소 상세(`pages/place/PlaceDetailPage.tsx`)의 MessageScreen 과 같은 역할이지만,
 * 공용 파일을 건드리지 않기 위해 마이페이지 안에 따로 둔다.
 */
export const CollectionMessage = ({
  title,
  description,
  onBack,
  onRetry,
}: CollectionMessageProps) => {
  return (
    <View className="flex-1 gap-5 bg-background px-5 py-8">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
        className="h-11 w-11 items-center justify-center rounded-full bg-surface"
        onPress={onBack}
      >
        <Entypo name="chevron-left" size={24} color={colors.foreground} />
      </Pressable>

      <View className="gap-2">
        <AppText variant="title">{title}</AppText>
        <AppText color="muted">{description}</AppText>
      </View>

      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="다시 시도"
          className="self-start rounded-full border border-primary px-5 py-2.5"
          onPress={onRetry}
        >
          <AppText color="primary" style={{ fontWeight: "800" }}>
            다시 시도
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
};
