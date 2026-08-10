import { AppText } from "@/components/AppText";
import { CollectionTabs } from "@/features/collection/components/CollectionTabs";
import { LoginPrompt } from "@/features/mypage/components/LoginPrompt";
import { OverviewCard } from "@/features/collection/components/OverviewCard";
import { RecentList } from "@/features/collection/components/RecentList";
import { RegionGrid } from "@/features/collection/components/RegionGrid";
import { ThemeList } from "@/features/collection/components/ThemeList";
import type { DogamRegion, DogamTab } from "@/features/collection/types";
import { useCollectionLayout } from "@/features/collection/useCollectionLayout";
import { useDogamData } from "@/features/collection/useDogamData";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

const CollectionPage = () => {
  const [tab, setTab] = useState<DogamTab>("regions");
  const { maxContentWidth, horizontalPadding, isCompact } =
    useCollectionLayout();
  const {
    isAuthenticated,
    overview,
    regions,
    themes,
    recent,
    error,
    isLoading,
    reload,
  } = useDogamData();

  // 도감 전용 상세는 provinceCode 를 그대로 키로 쓴다.
  // RegionId 변환이 없어져 잠금 아닌 도 카드가 전부 열린다 (충청도·경상도·전라도·울릉도·독도 포함).
  const openRegionDetail = (region: DogamRegion) => {
    router.push({
      pathname: "/collection/region/[code]",
      params: { code: region.provinceCode },
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View
        className="gap-5 pb-10 pt-5"
        style={{
          width: "100%",
          maxWidth: maxContentWidth,
          alignSelf: "center",
          paddingHorizontal: horizontalPadding,
        }}
      >
        <View className="gap-1">
          <AppText variant="title" size={isCompact ? 24 : 26}>
            여행 도감
          </AppText>
          <AppText color="muted" size={13}>
            여행의 순간들을 모아보세요
          </AppText>
        </View>

        {!isAuthenticated ? (
          <LoginPrompt
            onPress={() =>
              router.push({
                pathname: "/login",
                params: { redirect: "/collection" },
              })
            }
          />
        ) : isLoading ? (
          <View className="items-center gap-2 rounded-[20px] border border-foreground/10 bg-surface px-5 py-10">
            <AppText variant="subtitle">도감을 불러오는 중이에요</AppText>
            <AppText color="muted">잠시만 기다려주세요.</AppText>
          </View>
        ) : error ? (
          <View className="gap-4 rounded-[20px] border border-foreground/10 bg-surface px-5 py-6">
            <View className="gap-1">
              <AppText variant="subtitle">도감을 불러오지 못했어요</AppText>
              <AppText color="muted">
                {error.message || "잠시 후 다시 시도해주세요."}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="다시 시도"
              className="self-start rounded-full border border-primary/20 bg-primary/10 px-4 py-2"
              onPress={reload}
            >
              <AppText color="primary" style={{ fontWeight: "800" }}>
                다시 시도
              </AppText>
            </Pressable>
          </View>
        ) : (
          <>
            <CollectionTabs tab={tab} onChangeTab={setTab} />

            <OverviewCard overview={overview} />

            {tab === "regions" ? (
              <RegionGrid regions={regions} onSelectRegion={openRegionDetail} />
            ) : null}

            {tab === "themes" ? <ThemeList themes={themes} /> : null}

            {tab === "recent" ? (
              <RecentList
                recent={{ items: recent, nextCursor: null }}
                onSelectPlace={(item) => {
                  router.push({
                    pathname: "/map/list/[id]",
                    params: { id: item.placeId },
                  });
                }}
              />
            ) : null}
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default CollectionPage;
