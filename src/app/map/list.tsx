import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { recommendations } from "@/constants/recommendations";
import { Entypo, FontAwesome6 } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

export default function RecommendationListScreen() {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-5 px-5 pb-10 pt-5">
        <View className="flex-row items-center gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="뒤로 가기"
            className="h-11 w-11 items-center justify-center rounded-full bg-surface"
            onPress={() => router.back()}
          >
            <Entypo name="chevron-left" size={24} color={colors.foreground} />
          </Pressable>
          <View className="flex-1">
            <AppText variant="title">오늘의 추천 여행지</AppText>
            <AppText color="muted">지도에서 추천하는 여행지를 모아봤어요</AppText>
          </View>
        </View>

        <View className="gap-3">
          {recommendations.map((item) => (
            <Link
              key={item.id}
              href={{
                pathname: "/map/list/[id]",
                params: { id: item.id },
              }}
              asChild
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${item.title} 추천 여행지 보기`}
                className="flex-row overflow-hidden rounded-xl border border-foreground/10 bg-surface"
              >
                <View
                  className="h-[104px] w-[108px] items-center justify-center"
                  style={{ backgroundColor: item.accent }}
                >
                  <FontAwesome6
                    name={item.icon}
                    size={32}
                    color="rgba(244, 245, 244, 0.88)"
                  />
                </View>
                <View className="flex-1 justify-center gap-1.5 p-3">
                  <AppText className="text-base font-bold leading-[22px]">
                    {item.title}
                  </AppText>
                  <View className="flex-row items-center gap-1">
                    <Entypo
                      name="location-pin"
                      size={16}
                      color={colors.primary}
                    />
                    <AppText color="primary" size={13}>
                      {item.location}
                    </AppText>
                  </View>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
