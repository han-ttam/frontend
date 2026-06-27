import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { type RegionId } from "@/constants/regions";
import { InteractiveKoreaMap } from "@/features/map/components/InteractiveKoreaMap";
import { Entypo, FontAwesome6 } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";

const recommendations = [
  {
    title: "부산 해동용궁사",
    location: "부산 기장군",
    accent: "#376F85",
    icon: "water",
  },
  {
    title: "전주 한옥마을",
    location: "전북 전주시",
    accent: "#8B5D38",
    icon: "landmark",
  },
  {
    title: "성산일출봉",
    location: "제주 서귀포시",
    accent: "#617C45",
    icon: "mountain-sun",
  },
] as const;

const MapPage = () => {
  const [selectedRegionId, setSelectedRegionId] = useState<RegionId>();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full ">
        <View className="flex-row items-center justify-between gap-3.5">
          <View className="flex-1 flex-row items-center gap-3.5">
            <View className="h-[72px] w-[72px] items-center justify-center rounded-full border border-muted">
              <Image
                source={{
                  uri: "https://i.namu.wiki/i/vDDaVK4wm1-vPZgAOI65rbhLhr1vPCzBgoRKSS7mEFx4IH2vtHvvMN41Umw-taptksIW_WqnjwOdcGbAMpAmrQ.webp",
                }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>

            <View className="flex-1 gap-1">
              <AppText variant="subtitle">여행수집가님</AppText>

              <AppText variant="caption" color="muted">
                대한민국 여행 수집 진행도
              </AppText>
              <View className="flex-row items-center gap-1 ">
                <AppText color="primary" className="font-extrabold">
                  63%
                </AppText>
                <View className="h-2.5  flex-1 overflow-hidden rounded-full bg-surface">
                  <View className="h-full w-[60%] rounded-full bg-primary" />
                </View>
              </View>

              <AppText variant="caption">
                102
                <AppText color="muted" variant="caption">
                  {" "}
                  / 161 지역 수집
                </AppText>
              </AppText>
            </View>
          </View>

          <View className="  justify-center items-center gap-1 rounded-[18px] border border-muted bg-background p-3.5">
            <AppText color="muted" size={12}>
              총 여행 점수 315점
            </AppText>
            <AppText variant="subtitle">전국 127위</AppText>
          </View>
        </View>

        <View className="relative pb-12">
          <InteractiveKoreaMap
            selectedRegionId={selectedRegionId}
            onRegionPress={setSelectedRegionId}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="여행 인증하기"
            className="absolute bottom-2.5 right-3 h-20 w-20 items-center justify-center rounded-full border-primary/95 border-2   bg-primary/85"
          >
            <Entypo name="camera" size={30} color={colors.foreground} />
            <AppText
              variant="body"
              style={{ fontWeight: "bold", fontSize: 16 }}
            >
              인증하기
            </AppText>
          </Pressable>
        </View>

        <View className="gap-4 border-t border-foreground/10 pt-[22px]">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Entypo name="location-pin" size={24} color={colors.primary} />
              <AppText variant="subtitle">오늘의 추천 여행지</AppText>
            </View>
            <View className="flex-row items-center gap-1">
              <AppText color="muted">더보기</AppText>
              <Entypo name="chevron-right" size={20} color={colors.muted} />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3 pr-5">
              {recommendations.map((item) => (
                <Pressable
                  key={item.title}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.title} 추천 여행지 보기`}
                  className="w-[168px] overflow-hidden rounded-xl border border-foreground/10 bg-surface"
                >
                  <View
                    className="h-[102px] items-center justify-center"
                    style={{ backgroundColor: item.accent }}
                  >
                    <FontAwesome6
                      name={item.icon}
                      size={34}
                      color="rgba(244, 245, 244, 0.88)"
                    />
                  </View>
                  <View className="gap-1.5 p-3">
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
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  );
};

export default MapPage;
