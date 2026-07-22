import { AppText } from "@/components/AppText";
import { CollectionTabs } from "@/features/collection/components/CollectionTabs";
import { OverviewCard } from "@/features/collection/components/OverviewCard";
import { RecentList } from "@/features/collection/components/RecentList";
import { RegionGrid } from "@/features/collection/components/RegionGrid";
import { ThemeList } from "@/features/collection/components/ThemeList";
import {
  dogamOverview,
  dogamRecent,
  dogamRegions,
  dogamThemes,
} from "@/features/collection/mockData";
import type { DogamRegion, DogamTab } from "@/features/collection/types";
import { useCollectionLayout } from "@/features/collection/useCollectionLayout";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

const CollectionPage = () => {
  const [tab, setTab] = useState<DogamTab>("regions");
  const { maxContentWidth, horizontalPadding, isCompact } =
    useCollectionLayout();

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

        <CollectionTabs tab={tab} onChangeTab={setTab} />

        <OverviewCard overview={dogamOverview} />

        {tab === "regions" ? (
          <RegionGrid
            regions={dogamRegions}
            onSelectRegion={openRegionDetail}
          />
        ) : null}

        {tab === "themes" ? <ThemeList themes={dogamThemes} /> : null}

        {tab === "recent" ? (
          <RecentList
            recent={dogamRecent}
            onSelectPlace={(item) => {
              router.push({
                pathname: "/map/list/[id]",
                params: { id: item.placeId },
              });
            }}
          />
        ) : null}
      </View>
    </ScrollView>
  );
};

export default CollectionPage;
