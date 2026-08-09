import { ActivityIndicator, FlatList, Linking, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useNearbyPlaces } from "@/features/certification/hooks/useNearbyPlaces";
import type { NearbyPlace } from "@/features/certification/types";

/**
 * ✨ 희소 장소 배지 기준. 백엔드가 지금 모든 장소를 rarityWeight 1로 시딩해 둬서 이 조건은 아직
 * 한 번도 참이 되지 않는다(api.ts 의 DEFAULT_RARITY_WEIGHT 참고). 고장난 게 아니라 대기 상태다.
 */
const RARE_THRESHOLD = 2;

function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)}m`;
  return `${(distanceMeters / 1000).toFixed(1)}km`;
}

function goToCamera(placeId: string) {
  router.push({ pathname: "/certification/[placeId]/camera", params: { placeId } });
}

function HeroCard({ place }: { place: NearbyPlace }) {
  const isRare = place.rarityWeight >= RARE_THRESHOLD;

  return (
    <Pressable
      onPress={() => goToCamera(place.id)}
      accessibilityRole="button"
      accessibilityLabel={`${place.name}, ${formatDistance(place.distanceMeters)}${isRare ? ", 희소 장소" : ""}`}
      style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }]}
      className="mx-4 mt-4 rounded-3xl border border-emerald-400/40 bg-white/5 p-5"
    >
      {isRare && (
        <View className="mb-2 min-h-[28px] flex-row items-center gap-1 self-start rounded-full bg-emerald-500/20 px-3 py-1">
          <Text className="text-xs font-bold text-emerald-400">✨ 희소 장소</Text>
        </View>
      )}
      <Text numberOfLines={1} className="text-2xl font-extrabold text-white">
        {place.name}
      </Text>
      <Text className="mt-1 text-sm text-gray-300">
        {isRare
          ? `희귀 장소가 ${formatDistance(place.distanceMeters)} 근처에 있어요`
          : `${formatDistance(place.distanceMeters)} 근처에 있어요`}
      </Text>
      <View className="mt-4 min-h-[44px] items-center justify-center rounded-full bg-emerald-500 py-3">
        <Text className="text-base font-bold text-black">📷 인증하러 가기</Text>
      </View>
    </Pressable>
  );
}

function ListRow({ place }: { place: NearbyPlace }) {
  const isRare = place.rarityWeight >= RARE_THRESHOLD;

  return (
    <Pressable
      onPress={() => goToCamera(place.id)}
      accessibilityRole="button"
      accessibilityLabel={`${place.name}, ${formatDistance(place.distanceMeters)}${isRare ? ", 희소 장소" : ""}`}
      style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }]}
      className="mx-4 mb-3 min-h-[44px] flex-row items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
    >
      <View className="flex-1 flex-row items-center gap-2">
        {isRare && <Text className="text-emerald-400">✨</Text>}
        <Text numberOfLines={1} className="flex-1 text-base font-medium text-white">
          {place.name}
        </Text>
      </View>
      <Text className="ml-2 text-sm text-gray-400">{formatDistance(place.distanceMeters)}</Text>
    </Pressable>
  );
}

export default function PhotoScreen() {
  const { status, places, refreshing, retry } = useNearbyPlaces();

  if (status === "loading") {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#2dd4bf" />
      </SafeAreaView>
    );
  }

  if (status === "denied") {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black px-6">
        <Text className="text-center text-base text-white">위치 권한이 필요해요</Text>
        <Text className="mt-2 text-center text-sm text-gray-400">
          가까운 여행지를 찾으려면 위치 접근을 허용해주세요.
        </Text>
        <Pressable
          onPress={() => Linking.openSettings()}
          accessibilityRole="button"
          accessibilityLabel="설정으로 이동"
          className="mt-4 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-emerald-500 px-6 py-3"
        >
          <Text className="font-semibold text-black">설정으로 이동</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (status === "location-error" || status === "data-error") {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black px-6">
        <Text className="text-center text-base text-white">
          {status === "location-error" ? "위치를 확인하지 못했어요" : "근처 장소를 불러오지 못했어요"}
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-400">
          {status === "location-error"
            ? "기기의 위치 서비스가 켜져 있는지 확인해주세요."
            : "네트워크 상태를 확인하고 다시 시도해주세요."}
        </Text>
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

  if (places.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black px-6">
        <Text className="text-center text-base text-white">2km 반경 안에 장소가 없어요</Text>
        <Text className="mt-2 text-center text-sm text-gray-400">다른 지역에서 다시 확인해보세요.</Text>
      </SafeAreaView>
    );
  }

  const [hero, ...rest] = places;

  return (
    <SafeAreaView className="flex-1 bg-black">
      {refreshing && (
        <Text className="mt-2 text-center text-xs text-gray-500" accessibilityLabel="위치 갱신 중">
          위치 갱신 중…
        </Text>
      )}
      <FlatList
        data={rest}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListRow place={item} />}
        ListHeaderComponent={
          <>
            <HeroCard place={hero} />
            {rest.length > 0 && <Text className="mx-4 mb-2 mt-6 text-sm font-semibold text-gray-400">근처 장소</Text>}
          </>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}
