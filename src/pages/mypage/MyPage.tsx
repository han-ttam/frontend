import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { CollectionProgressTab } from "@/features/mypage/components/CollectionProgressTab";
import { ProfileCard } from "@/features/mypage/components/ProfileCard";
import { RankingTab } from "@/features/mypage/components/RankingTab";
import {
  mypageCollections,
  mypageProfile,
  mypageRankings,
} from "@/features/mypage/mockData";
import type {
  MypageCollectionItem,
  RankingPeriod,
} from "@/features/mypage/types";
import { useMypageLayout } from "@/features/mypage/useMypageLayout";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

const TABS = [
  { id: "collections", label: "도감 진행률" },
  { id: "ranking", label: "랭킹" },
] as const;

type MypageTab = (typeof TABS)[number]["id"];

const MyPage = () => {
  const [tab, setTab] = useState<MypageTab>("collections");
  const [period, setPeriod] = useState<RankingPeriod>("CUMULATIVE");
  const { maxContentWidth, isCompact } = useMypageLayout();

  const profile = mypageProfile;
  const collections = mypageCollections;
  const ranking = mypageRankings[period];

  const handleSelectCollection = (collection: MypageCollectionItem) => {
    router.push({
      pathname: "/mypage/collections/[id]",
      params: { id: collection.id },
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View
        className={[
          "gap-5 pb-10 pt-5",
          isCompact ? "px-4" : "px-5",
        ].join(" ")}
        style={{ width: "100%", maxWidth: maxContentWidth, alignSelf: "center" }}
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="shrink gap-1">
            <AppText variant="title" size={isCompact ? 22 : 24} numberOfLines={1}>
              마이페이지
            </AppText>
            <AppText color="muted" size={13} numberOfLines={1}>
              나의 여행 기록을 한눈에!
            </AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="설정 열기"
            className="h-11 w-11 items-center justify-center rounded-full border border-foreground/15 bg-surface"
          >
            <Feather name="settings" size={19} color={colors.foreground} />
          </Pressable>
        </View>

        <ProfileCard
          profile={profile}
          collectedCount={collections.overall.collected}
          totalCount={collections.overall.total}
        />

        <View className="flex-row overflow-hidden rounded-2xl bg-surface">
          {TABS.map((item) => {
            const isSelected = tab === item.id;

            return (
              <Pressable
                key={item.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${item.label} 탭`}
                className={[
                  "flex-1 items-center border-b-2 py-3.5",
                  isSelected ? "border-primary" : "border-transparent",
                ].join(" ")}
                onPress={() => setTab(item.id)}
              >
                <AppText
                  color={isSelected ? "primary" : "muted"}
                  size={15}
                  style={{ fontWeight: "700" }}
                >
                  {item.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {tab === "collections" ? (
          <CollectionProgressTab
            collections={collections}
            onSelectCollection={handleSelectCollection}
          />
        ) : (
          <RankingTab
            profile={profile}
            ranking={ranking}
            period={period}
            onChangePeriod={setPeriod}
          />
        )}
      </View>
    </ScrollView>
  );
};

export default MyPage;
