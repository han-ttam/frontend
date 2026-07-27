import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";

import { getPlaceAndScore, getCertifyResult } from "@/features/certification";
import { useAsyncData } from "@/features/certification/hooks/useAsyncData";
import { ScorePreviewCard } from "@/features/certification/components/ScorePreviewCard";

function showComingSoon() {
  Toast.show({ type: "info", text1: "준비 중이에요" });
}

export default function CompleteScreen() {
  const { placeId, photoUri } = useLocalSearchParams<{ placeId: string; photoUri?: string }>();
  const { data, loading } = useAsyncData(() => getPlaceAndScore(placeId));

  if (loading || !data) {
    return <SafeAreaView className="flex-1 bg-black" />;
  }

  const { place, score } = data;
  const result = getCertifyResult(place.name);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: "center" }}>
        <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-400">
          <Text className="text-3xl text-emerald-400">✓</Text>
        </View>
        <Text className="mt-4 text-2xl font-extrabold text-white">
          인증 <Text className="text-emerald-400">완료!</Text>
        </Text>
        <Text className="mt-1 text-sm text-gray-400">{place.name}을 도감에 수집했어요</Text>

        <View className="mt-6 w-full rounded-2xl bg-white/5 p-4">
          <Text className="text-sm text-gray-400">{result.region.name} 수집 현황</Text>
          <View className="mt-2 flex-row items-center gap-3">
            <Text className="text-2xl font-bold text-gray-500">{result.region.beforePercent}%</Text>
            <Text className="text-emerald-400">→</Text>
            <Text className="text-3xl font-extrabold text-emerald-400">{result.region.afterPercent}%</Text>
          </View>
          <Text className="text-xs text-gray-500">
            {result.region.collected} / {result.region.total}
          </Text>
        </View>

        {photoUri && (
          <Image
            source={{ uri: photoUri }}
            className="mt-4 h-48 w-full rounded-2xl"
            accessibilityLabel="인증한 사진"
          />
        )}

        <View className="mt-4 w-full">
          <Text className="text-base font-semibold text-white">📍 {place.name}</Text>
          {place.address && <Text className="text-xs text-gray-400">{place.address}</Text>}
          {place.description && <Text className="mt-1 text-sm text-gray-300">{place.description}</Text>}
        </View>

        <View className="mt-4 w-full">
          <ScorePreviewCard
            score={score}
            label="여행 점수"
            note="지역 보너스가 적용되었어요!"
          />
        </View>

        <Pressable
          onPress={showComingSoon}
          accessibilityRole="button"
          accessibilityLabel="도감에서 확인하기 (준비 중)"
          accessibilityState={{ disabled: true }}
          className="mt-6 min-h-[44px] w-full items-center justify-center rounded-full bg-white/10 py-4"
        >
          <Text className="text-base font-bold text-gray-400">📖 도감에서 확인하기</Text>
        </Pressable>
        <Pressable
          onPress={showComingSoon}
          accessibilityRole="button"
          accessibilityLabel="지도로 돌아가기 (준비 중)"
          accessibilityState={{ disabled: true }}
          className="mt-3 min-h-[44px] items-center justify-center"
        >
          <Text className="text-sm text-gray-500">지도로 돌아가기</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
