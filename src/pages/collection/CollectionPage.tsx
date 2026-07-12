import { AppText } from "@/components/AppText";
import { getRegionIdByApiCode } from "@/constants/regionCodes";
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

const canOpenRegionDetail = (region: DogamRegion) => {
  return getRegionIdByApiCode(region.provinceCode) !== undefined;
};

const CollectionPage = () => {
  const [tab, setTab] = useState<DogamTab>("regions");
  const { maxContentWidth, horizontalPadding, isCompact } =
    useCollectionLayout();

  const openRegionDetail = (region: DogamRegion) => {
    const regionId = getRegionIdByApiCode(region.provinceCode);

    if (!regionId) {
      return;
    }

    router.push({
      pathname: "/map/region/[id]",
      params: { id: regionId },
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
            isRegionOpenable={canOpenRegionDetail}
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
