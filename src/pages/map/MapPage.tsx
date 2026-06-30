import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { recommendations } from "@/constants/recommendations";
import { type RegionId } from "@/constants/regions";
import { InteractiveKoreaMap } from "@/features/map/components/InteractiveKoreaMap";
import { TravelProofConsentModal } from "@/features/map/components/TravelProofConsentModal";
import { Entypo, FontAwesome6 } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";

const MapPage = () => {
  const [selectedRegionId, setSelectedRegionId] = useState<RegionId>();
  const [isConsentVisible, setIsConsentVisible] = useState(false);

  return (
    <>
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
                <AppText variant="subtitle">여행 수집가</AppText>

                <AppText variant="caption" color="muted">
                  대한민국 여행 수집 진행률
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
                    / 161 여행지
                  </AppText>
                </AppText>
              </View>
            </View>

            <View className="items-center justify-center gap-1 rounded-[18px] border border-muted bg-background p-3.5">
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
              className="absolute bottom-2.5 right-3 h-20 w-20 items-center justify-center rounded-full border-2 border-primary/95 bg-primary/85"
              onPress={() => setIsConsentVisible(true)}
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
              <Link href="/map/list" asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="추천 여행지 더보기"
                  className="flex-row items-center gap-1"
                >
                  <AppText color="muted">더보기</AppText>
                  <Entypo name="chevron-right" size={20} color={colors.muted} />
                </Pressable>
              </Link>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3 pr-5">
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
                  </Link>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      <TravelProofConsentModal
        visible={isConsentVisible}
        onClose={() => setIsConsentVisible(false)}
        onConfirm={() => setIsConsentVisible(false)}
      />
    </>
  );
};

export default MapPage;
