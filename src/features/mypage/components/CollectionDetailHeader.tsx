import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { useMypageLayout } from "@/features/mypage/useMypageLayout";
import { Entypo } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

type CollectionDetailHeaderProps = {
  typeLabel: string;
  title: string;
  description?: string | null;
  onBack: () => void;
};

export const CollectionDetailHeader = ({
  typeLabel,
  title,
  description,
  onBack,
}: CollectionDetailHeaderProps) => {
  const { isCompact } = useMypageLayout();

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          className="-ml-1 flex-row items-center py-1 pr-1"
          onPress={onBack}
        >
          <Entypo name="chevron-left" size={20} color={colors.muted} />
          <AppText color="muted" size={15} style={{ fontWeight: "600" }}>
            내 정보
          </AppText>
        </Pressable>

        <View className="shrink rounded-full bg-primary/15 px-3 py-1">
          <AppText
            color="primary"
            size={12}
            numberOfLines={1}
            style={{ fontWeight: "800" }}
          >
            {typeLabel}
          </AppText>
        </View>
      </View>

      <View className="gap-1">
        <AppText variant="title" size={isCompact ? 22 : 26} numberOfLines={2}>
          {title}
        </AppText>
        {description ? (
          <AppText color="muted" size={isCompact ? 13 : 14} numberOfLines={2}>
            {description}
          </AppText>
        ) : null}
      </View>
    </View>
  );
};
