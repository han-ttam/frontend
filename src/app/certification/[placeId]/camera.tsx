import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, Linking, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { CameraView, useCameraPermissions, type CameraType, type FlashMode } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

import { loadPlaceAndScore, getCompositions } from "@/features/certification";
import { useAsyncData } from "@/features/certification/hooks/useAsyncData";

const DEFAULT_MISSION = "이 장소의 사진을 찍어주세요";

const BRACKET_SIZE = 18;
const BRACKET_THICKNESS = 2;
const BRACKET_RADIUS = 8;

/** 참고 구도 레퍼런스(ui_image/05)의 둥근 모서리 가이드 + 3분할 그리드를 CameraView 위에 겹쳐 그린다. */
function FrameGuides() {
  const bracketBase = {
    position: "absolute" as const,
    width: BRACKET_SIZE,
    height: BRACKET_SIZE,
    borderColor: "white",
  };

  return (
    // top: 헤더(닫기·플래시 버튼 행)와 미션 문구 pill 아래로 내림. bottom: 하단 버튼 행 위로 올림 — 겹치지 않게.
    <View pointerEvents="none" style={{ position: "absolute", top: 116, bottom: 132, left: 20, right: 20 }}>
      <View style={{ position: "absolute", left: "33%", top: 0, bottom: 0, width: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
      <View style={{ position: "absolute", left: "66%", top: 0, bottom: 0, width: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
      <View style={{ position: "absolute", top: "33%", left: 0, right: 0, height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
      <View style={{ position: "absolute", top: "66%", left: 0, right: 0, height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
      <View
        style={{
          ...bracketBase,
          top: 0,
          left: 0,
          borderTopWidth: BRACKET_THICKNESS,
          borderLeftWidth: BRACKET_THICKNESS,
          borderTopLeftRadius: BRACKET_RADIUS,
        }}
      />
      <View
        style={{
          ...bracketBase,
          top: 0,
          right: 0,
          borderTopWidth: BRACKET_THICKNESS,
          borderRightWidth: BRACKET_THICKNESS,
          borderTopRightRadius: BRACKET_RADIUS,
        }}
      />
      <View
        style={{
          ...bracketBase,
          bottom: 0,
          left: 0,
          borderBottomWidth: BRACKET_THICKNESS,
          borderLeftWidth: BRACKET_THICKNESS,
          borderBottomLeftRadius: BRACKET_RADIUS,
        }}
      />
      <View
        style={{
          ...bracketBase,
          bottom: 0,
          right: 0,
          borderBottomWidth: BRACKET_THICKNESS,
          borderRightWidth: BRACKET_THICKNESS,
          borderBottomRightRadius: BRACKET_RADIUS,
        }}
      />
    </View>
  );
}

export default function CameraScreen() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  const { data, loading, error, retry } = useAsyncData(() => loadPlaceAndScore(placeId));
  const [capturing, setCapturing] = useState(false);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [isFocused, setIsFocused] = useState(true);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const compositions = data ? getCompositions(placeId) : [];

  // 화면 포커스를 잃으면(다른 화면으로 이동·백그라운드 전환) CameraView를 언마운트해 카메라 하드웨어를 해제한다.
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  const ensureCameraPermission = useCallback(async () => {
    if (permission?.granted) return true;
    const result = await requestPermission();
    if (!result.granted) {
      Alert.alert("카메라 권한이 필요해요", "설정에서 카메라 접근을 허용해주세요.", [
        { text: "취소", style: "cancel" },
        { text: "설정으로 이동", onPress: () => Linking.openSettings() },
      ]);
      return false;
    }
    return true;
  }, [permission, requestPermission]);

  const handleCapture = useCallback(async () => {
    if (!(await ensureCameraPermission())) return;
    if (!cameraRef.current) return;

    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      router.push({
        pathname: "/certification/[placeId]/review",
        params: { placeId, photoUri: photo.uri },
      });
    } finally {
      setCapturing(false);
    }
  }, [ensureCameraPermission, placeId]);

  const handleGalleryPick = useCallback(async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("갤러리 접근 권한이 필요해요", "설정에서 사진 라이브러리 접근을 허용해주세요.", [
        { text: "취소", style: "cancel" },
        { text: "설정으로 이동", onPress: () => Linking.openSettings() },
      ]);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (result.canceled) return;

    const photoUri = result.assets[0]?.uri;
    if (photoUri) {
      router.push({
        pathname: "/certification/[placeId]/review",
        params: { placeId, photoUri },
      });
    }
  }, [placeId]);

  const toggleFacing = useCallback(() => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }, []);

  const toggleFlash = useCallback(() => {
    setFlash((current) => (current === "off" ? "on" : "off"));
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#2dd4bf" />
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black px-6">
        <Text className="text-center text-base text-white">{error ?? "장소 정보를 불러오지 못했어요"}</Text>
        <Pressable
          onPress={retry}
          accessibilityRole="button"
          accessibilityLabel="다시 시도"
          className="mt-4 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-emerald-500 px-6 py-3"
        >
          <Text className="font-semibold text-black">다시 시도</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const { place } = data;

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* 카메라 프리뷰가 화면 전체를 채운다 — 헤더/버튼은 그 위에 떠 있는 오버레이. */}
      <View className="relative flex-1">
        {isFocused && permission?.granted ? (
          <CameraView ref={cameraRef} style={{ position: "absolute", inset: 0 }} facing={facing} flash={flash} />
        ) : (
          <Pressable
            onPress={ensureCameraPermission}
            accessibilityRole="button"
            accessibilityLabel="카메라 권한 요청"
            className="absolute inset-0 items-center justify-center bg-black"
          >
            <Text className="text-center text-sm text-gray-400">카메라 권한이 필요해요{"\n"}탭하여 허용하기</Text>
          </Pressable>
        )}

        <FrameGuides />

        <View className="absolute inset-x-0 top-0 flex-row items-center justify-between px-4 pt-2">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="닫기"
            className="h-11 w-11 items-center justify-center rounded-full bg-black/40"
          >
            <Text className="text-xl text-white">×</Text>
          </Pressable>
          <Text className="text-lg font-bold text-white" style={{ textShadowColor: "#000", textShadowRadius: 4 }}>
            {place.name} 인증
          </Text>
          <Pressable
            onPress={toggleFlash}
            accessibilityRole="button"
            accessibilityLabel={flash === "on" ? "플래시 끄기" : "플래시 켜기"}
            className="h-11 w-11 items-center justify-center rounded-full bg-black/40"
          >
            <Ionicons name={flash === "on" ? "flash" : "flash-off"} size={22} color="white" />
          </Pressable>
        </View>

        <View className="absolute inset-x-4 top-16 items-center">
          <View className="flex-row items-center gap-2 rounded-full bg-black/40 px-4 py-2">
            <Ionicons name="camera-outline" size={16} color="#2dd4bf" />
            <Text className="text-sm text-white">{place.mission ?? DEFAULT_MISSION}</Text>
          </View>
        </View>

        {compositions.length > 0 && (
          <View className="absolute bottom-32 left-4">
            <Text
              className="mb-2 self-start rounded bg-black/60 px-2 py-1 text-xs text-white"
              accessibilityLabel="추천 촬영 구도 예시"
            >
              참고 구도
            </Text>
            <View className="h-20 w-28 overflow-hidden rounded-lg border border-emerald-400 bg-white/10">
              {compositions[0]?.exampleImageUrl ? (
                <Image
                  source={{ uri: compositions[0].exampleImageUrl }}
                  className="h-full w-full"
                  accessibilityLabel="추천 촬영 구도 예시 이미지"
                />
              ) : null}
            </View>
          </View>
        )}

        <View className="absolute inset-x-0 bottom-0 flex-row items-center justify-center gap-10 px-6 pb-6 pt-4">
          <Pressable
            onPress={handleGalleryPick}
            accessibilityRole="button"
            accessibilityLabel="갤러리에서 사진 가져오기"
            className="h-11 w-11 items-center justify-center rounded-full bg-black/40"
          >
            <Ionicons name="images-outline" size={22} color="white" />
          </Pressable>
          <Pressable
            onPress={handleCapture}
            disabled={capturing}
            accessibilityRole="button"
            accessibilityLabel="사진 촬영"
            className="h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-emerald-500"
          >
            {capturing && <ActivityIndicator color="#000" />}
          </Pressable>
          <Pressable
            onPress={toggleFacing}
            accessibilityRole="button"
            accessibilityLabel="전후면 카메라 전환"
            className="h-11 w-11 items-center justify-center rounded-full bg-black/40"
          >
            <Ionicons name="camera-reverse-outline" size={22} color="white" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
