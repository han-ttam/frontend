import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

type LoginPromptProps = {
  onPress: () => void;
};

/**
 * 마이페이지는 전부 /me/* 라 로그인이 필요하다.
 * 다만 PRD 상 로그인은 강제가 아니라 권유이므로, 탭을 유지한 채 화면 안에서만
 * 안내한다(게스트를 로그인 화면으로 밀어내지 않는다).
 */
export const LoginPrompt = ({ onPress }: LoginPromptProps) => {
  return (
    <View className="items-center gap-3 rounded-[20px] border border-foreground/10 bg-surface px-5 py-10">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Feather name="smile" size={26} color={colors.primary} />
      </View>

      <View className="items-center gap-1">
        <AppText variant="subtitle">
          로그인하면 내 도감과 랭킹을 볼 수 있어요
        </AppText>
        <AppText color="muted" size={13}>
          방문한 여행지가 도감에 쌓입니다.
        </AppText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="로그인하기"
        className="mt-1 rounded-full bg-primary px-6 py-3"
        onPress={onPress}
      >
        <AppText size={15} style={{ color: colors.background, fontWeight: "800" }}>
          로그인하기
        </AppText>
      </Pressable>
    </View>
  );
};
