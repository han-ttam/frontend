import { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import { getCompositions, toErrorMessage } from "@/features/certification";
import { usePlaceAndScore } from "@/features/certification/hooks/usePlaceAndScore";
import { useSubmitVisit } from "@/features/certification/hooks/useSubmitVisit";
import { ScorePreviewCard } from "@/features/certification/components/ScorePreviewCard";
import type { Visibility } from "@/features/certification/types";

const CAPTION_MAX_LENGTH = 100;

export default function ReviewScreen() {
  const { placeId, photoUri } = useLocalSearchParams<{ placeId: string; photoUri: string }>();
  const { data, isLoading, error, reload } = usePlaceAndScore(placeId);
  const { submit, submitting, error: submitError } = useSubmitVisit();

  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("PUBLIC");

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#2dd4bf" />
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black px-6">
        <Text className="text-center text-base text-white">{toErrorMessage(error, "장소 정보를 불러오지 못했어요")}</Text>
        <Pressable
          onPress={() => reload()}
          accessibilityRole="button"
          accessibilityLabel="다시 시도"
          className="mt-4 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-emerald-500 px-6 py-3"
        >
          <Text className="font-semibold text-black">다시 시도</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const { place, score } = data;
  const compositions = getCompositions(placeId);

  const handleSubmit = async () => {
    const success = await submit({ placeId, caption: caption || undefined, visibility });
    if (success) {
      router.replace({ pathname: "/certification/[placeId]/complete", params: { placeId, photoUri } });
    }
  };

  const handleRetake = () => {
    router.replace({ pathname: "/certification/[placeId]/camera", params: { placeId } });
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-row items-center justify-between px-4 pt-2">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          className="h-11 w-11 items-center justify-center"
        >
          <Text className="text-xl text-white">←</Text>
        </Pressable>
        <Text className="text-lg font-bold text-white">방문 인증하기</Text>
        <Pressable
          onPress={handleRetake}
          accessibilityRole="button"
          accessibilityLabel="다시 찍기"
          className="min-h-[44px] items-center justify-center rounded-full border border-white/20 px-3"
        >
          <Text className="text-sm text-white">↻ 다시 찍기</Text>
        </Pressable>
      </View>
      <Text className="px-4 pb-2 text-center text-sm text-gray-400">사진을 확인하고 인증을 올려주세요</Text>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 24 }}>
        <Image
          source={{ uri: photoUri }}
          className="h-56 w-full rounded-2xl"
          accessibilityLabel="촬영한 인증 사진"
        />

        <View
          className="mt-4 flex-row items-center justify-between rounded-2xl bg-white/5 p-4"
          accessibilityLabel={`${place.name}, 현재 위치와 장소가 자동으로 확인 중이에요`}
        >
          <View className="flex-row items-center gap-3">
            <Text className="text-emerald-400">✓</Text>
            <View>
              <Text className="text-base font-semibold text-white">{place.name}</Text>
              <Text className="text-xs text-gray-400">현재 위치와 장소를 확인 중이에요</Text>
            </View>
          </View>
          <Text>📍</Text>
        </View>

        <View className="mt-4 rounded-2xl bg-white/5 p-4">
          <Text className="mb-3 text-sm font-semibold text-white">📷 사진 구도 확인</Text>
          {compositions.map((c, index) => (
            <View
              key={c.seq}
              className="flex-row items-center"
              style={{ marginBottom: index === compositions.length - 1 ? 0 : 12 }}
            >
              <View className="h-11 w-11 items-center justify-center rounded-lg bg-white/10">
                <Text className="text-emerald-400">✓</Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-medium text-white">{c.title}</Text>
                <Text className="text-xs text-gray-400">{c.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-4 rounded-2xl bg-white/5 p-4">
          <Text className="mb-2 text-sm font-semibold text-white">✏️ 여행 한 줄 기록 (선택)</Text>
          <TextInput
            value={caption}
            onChangeText={(t) => setCaption(t.slice(0, CAPTION_MAX_LENGTH))}
            placeholder="이 장소에서 기억하고 싶은 순간은?"
            placeholderTextColor="#6b7280"
            multiline
            maxLength={CAPTION_MAX_LENGTH}
            accessibilityLabel="여행 한 줄 기록 입력"
            className="min-h-[44px] text-base text-white"
          />
          <Text className="text-right text-xs text-gray-500">
            {caption.length}/{CAPTION_MAX_LENGTH}
          </Text>
        </View>

        <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-white/5 p-4">
          <Text className="text-sm font-semibold text-white">🔒 공개 설정</Text>
          <View className="flex-row gap-4">
            {(["PRIVATE", "PUBLIC"] as Visibility[]).map((v) => (
              <Pressable
                key={v}
                onPress={() => setVisibility(v)}
                accessibilityRole="radio"
                accessibilityState={{ selected: visibility === v }}
                accessibilityLabel={v === "PRIVATE" ? "나만 보기" : "전체 공개"}
                className="min-h-[44px] flex-row items-center gap-2"
              >
                <View
                  className={`h-5 w-5 rounded-full border-2 ${
                    visibility === v ? "border-emerald-400 bg-emerald-400" : "border-gray-500"
                  }`}
                />
                <Text className="text-sm text-white">{v === "PRIVATE" ? "나만 보기" : "전체 공개"}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-4">
          <ScorePreviewCard
            score={score}
            label="인증 시 여행 점수"
            note="기본 점수에 지역 가중치와 장소 희소도 가중치가 적용돼요."
          />
        </View>

        {submitError && <Text className="mt-3 text-center text-sm text-red-400">{submitError}</Text>}

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          accessibilityRole="button"
          accessibilityLabel="인증 올리기"
          className="mt-4 min-h-[44px] items-center justify-center rounded-full bg-emerald-500 py-4"
        >
          {submitting ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text className="text-base font-bold text-black">📷 인증 올리기</Text>
          )}
        </Pressable>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="나중에 올리기"
          className="mt-3 min-h-[44px] items-center justify-center"
        >
          <Text className="text-sm text-gray-400">나중에 올리기</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
