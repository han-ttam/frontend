import { AppText } from "@/components/AppText";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { colors } from "@/constants/colors";
import { useBookmarksData } from "@/features/map/useBookmarksData";
import type { BookmarkVisitStatusDto } from "@/lib/api/bookmarks";
import { Entypo } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, ScrollView, View } from "react-native";

const statusLabel: Record<BookmarkVisitStatusDto, string> = {
  NONE: "방문 예정",
  VISITED: "방문 완료",
};

export default function FavoriteListPage() {
  const { data: bookmarks, error, isLoading, reload } = useBookmarksData();

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
          <View className="flex-1 gap-1">
            <AppText variant="title">찜한 여행지</AppText>
            <AppText color="muted">
              저장한 여행지를 서버에서 바로 불러오고 있어요.
            </AppText>
          </View>
        </View>

        <View className="self-start rounded-full border border-primary/20 bg-primary/10 px-3 py-2">
          <AppText color="primary" style={{ fontWeight: "800" }}>
            총 {bookmarks.length}곳
          </AppText>
        </View>

        {isLoading ? (
          <View className="items-center gap-2 rounded-[20px] border border-foreground/10 bg-surface px-5 py-10">
            <AppText variant="subtitle">찜 목록을 불러오는 중이에요</AppText>
            <AppText color="muted">잠시만 기다려주세요.</AppText>
          </View>
        ) : null}

        {!isLoading && error ? (
          <View className="gap-4 rounded-[20px] border border-foreground/10 bg-surface px-5 py-6">
            <View className="gap-1">
              <AppText variant="subtitle">찜 목록을 불러오지 못했어요</AppText>
              <AppText color="muted">
                {error.message.includes("401")
                  ? "로그인 상태를 확인한 뒤 다시 시도해주세요."
                  : "잠시 후 다시 시도해주세요."}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="찜 목록 다시 불러오기"
              className="self-start rounded-full border border-primary/20 bg-primary/10 px-4 py-2"
              onPress={() => reload()}
            >
              <AppText color="primary" style={{ fontWeight: "800" }}>
                다시 시도
              </AppText>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && !error && bookmarks.length === 0 ? (
          <View className="items-center gap-2 rounded-[20px] border border-foreground/10 bg-surface px-5 py-10">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Entypo name="heart" size={22} color={colors.primary} />
            </View>
            <AppText variant="subtitle">아직 찜한 여행지가 없어요</AppText>
            <AppText color="muted">마음에 드는 여행지를 찜해보세요.</AppText>
          </View>
        ) : null}

        {!isLoading && !error && bookmarks.length > 0 ? (
          <View className="gap-3">
            {bookmarks.map((spot) => (
              <View
                key={spot.placeId}
                className="flex-row gap-3 overflow-hidden rounded-[20px] border border-foreground/10 bg-surface p-3"
              >
                {spot.imageUrl ? (
                  <Image
                    source={{ uri: spot.imageUrl }}
                    className="rounded-xl"
                    style={{ width: 96, height: 96 }}
                    resizeMode="cover"
                  />
                ) : (
                  <ImagePlaceholder
                    className="rounded-xl border border-foreground/10"
                    style={{ width: 96, height: 96 }}
                  />
                )}

                <View className="flex-1 justify-center gap-2">
                  <View className="flex-row items-center gap-2">
                    <View className="rounded-full bg-primary/10 px-2.5 py-1">
                      <AppText
                        color="primary"
                        size={12}
                        style={{ fontWeight: "800" }}
                      >
                        찜
                      </AppText>
                    </View>
                  </View>

                  <AppText variant="subtitle" numberOfLines={1}>
                    {spot.name}
                  </AppText>

                  <View className="flex-row items-center gap-1">
                    <Entypo name="location-pin" size={15} color={colors.muted} />
                    <AppText color="muted" size={12} numberOfLines={1}>
                      {spot.address}
                    </AppText>
                  </View>

                  {spot.visitStatus ? (
                    <View className="flex-row items-center justify-between">
                      <AppText
                        color="primary"
                        size={12}
                        style={{ fontWeight: "800" }}
                      >
                        {statusLabel[spot.visitStatus]}
                      </AppText>
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
