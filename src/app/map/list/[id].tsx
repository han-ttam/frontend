import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { recommendations } from "@/constants/recommendations";
import { Entypo, FontAwesome6 } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

export default function RecommendationDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const recommendation = recommendations.find((item) => item.id === id);

  if (!recommendation) {
    return (
      <View className="flex-1 gap-5 bg-background px-5 py-8">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          className="h-11 w-11 items-center justify-center rounded-full bg-surface"
          onPress={() => router.back()}
        >
          <Entypo name="chevron-left" size={24} color={colors.foreground} />
        </Pressable>
        <View className="gap-2">
          <AppText variant="title">여행지를 찾을 수 없어요</AppText>
          <AppText color="muted">선택한 추천 여행지 정보를 불러올 수 없습니다.</AppText>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-6 px-5 pb-10 pt-5">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          className="h-11 w-11 items-center justify-center rounded-full bg-surface"
          onPress={() => router.back()}
        >
          <Entypo name="chevron-left" size={24} color={colors.foreground} />
        </Pressable>

        <View
          className="aspect-[16/10] items-center justify-center rounded-xl"
          style={{ backgroundColor: recommendation.accent }}
        >
          <FontAwesome6
            name={recommendation.icon}
            size={56}
            color="rgba(244, 245, 244, 0.9)"
          />
        </View>

        <View className="gap-2">
          <AppText variant="display">{recommendation.title}</AppText>
          <View className="flex-row items-center gap-1.5">
            <Entypo name="location-pin" size={18} color={colors.primary} />
            <AppText color="primary" size={15}>
              {recommendation.location}
            </AppText>
          </View>
        </View>

        <View className="gap-3 rounded-xl bg-surface p-4">
          <AppText variant="subtitle">오늘의 추천 여행지</AppText>
          <AppText color="muted">
            지도 화면의 추천 목록에서 연결되는 상세 페이지입니다. 여행지 데이터가
            준비되면 사진, 도장, 리뷰, 방문 기록을 이 화면에 확장할 수 있습니다.
          </AppText>
        </View>
      </View>
    </ScrollView>
  );
}
