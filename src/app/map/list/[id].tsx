import { colors } from "@/constants/colors";
import { Entypo } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

export default function RecommendationDetailScreen() {
  return (
    <View className="flex-1 bg-background px-5 py-8">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
        className="h-11 w-11 items-center justify-center rounded-full bg-surface"
        onPress={() => router.back()}
      >
        <Entypo name="chevron-left" size={24} color={colors.foreground} />
      </Pressable>
    </View>
  );
}
