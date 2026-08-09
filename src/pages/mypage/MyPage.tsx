import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { CollectionProgressTab } from "@/features/mypage/components/CollectionProgressTab";
import { LoginPrompt } from "@/features/mypage/components/LoginPrompt";
import { ProfileCard } from "@/features/mypage/components/ProfileCard";
import { RankingTab } from "@/features/mypage/components/RankingTab";
import { SettingsModal } from "@/features/mypage/components/SettingsModal";
import type {
  MypageCollectionItem,
  MypageProfile,
  MypageRanking,
  RankingPeriod,
} from "@/features/mypage/types";
import { useMypageData } from "@/features/mypage/useMypageData";
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { maxContentWidth, isCompact } = useMypageLayout();
  const {
    isAuthenticated,
    profile,
    ranking,
    collections,
    overall,
    error,
    isLoading,
    reload,
  } = useMypageData(period);

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
            onPress={() => setIsSettingsOpen(true)}
          >
            <Feather name="settings" size={19} color={colors.foreground} />
          </Pressable>
        </View>

        {!isAuthenticated ? (
          <LoginPrompt
            onPress={() =>
              router.push({
                pathname: "/login",
                params: { redirect: "/mypage" },
              })
            }
          />
        ) : isLoading ? (
          <View className="items-center gap-2 rounded-[20px] border border-foreground/10 bg-surface px-5 py-10">
            <AppText variant="subtitle">내 정보를 불러오는 중이에요</AppText>
            <AppText color="muted">잠시만 기다려주세요.</AppText>
          </View>
        ) : !profile ? (
          <View className="gap-4 rounded-[20px] border border-foreground/10 bg-surface px-5 py-6">
            <View className="gap-1">
              <AppText variant="subtitle">내 정보를 불러오지 못했어요</AppText>
              <AppText color="muted">
                {error?.message ?? "잠시 후 다시 시도해주세요."}
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
          <MypageBody
            collections={collections}
            isCompact={isCompact}
            onSelectCollection={handleSelectCollection}
            onChangePeriod={setPeriod}
            overall={overall}
            period={period}
            profile={profile}
            ranking={ranking}
            setTab={setTab}
            tab={tab}
          />
        )}
      </View>

      <SettingsModal
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </ScrollView>
  );
};

type MypageBodyProps = {
  collections: MypageCollectionItem[];
  isCompact: boolean;
  onSelectCollection: (collection: MypageCollectionItem) => void;
  onChangePeriod: (period: RankingPeriod) => void;
  overall: { collected: number; total: number } | undefined;
  period: RankingPeriod;
  profile: MypageProfile;
  ranking: MypageRanking | undefined;
  setTab: (tab: MypageTab) => void;
  tab: MypageTab;
};

const MypageBody = ({
  collections,
  onSelectCollection,
  onChangePeriod,
  overall,
  period,
  profile,
  ranking,
  setTab,
  tab,
}: MypageBodyProps) => {
  // 전국 수집현황 조회가 실패해도 프로필은 보여준다.
  const progress = overall ?? { collected: 0, total: 0 };

  return (
    <>
      <ProfileCard
        profile={profile}
        collectedCount={progress.collected}
        totalCount={progress.total}
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
          collections={{
            overall: progress,
            items: collections,
            nextCursor: null,
          }}
          onSelectCollection={onSelectCollection}
        />
      ) : ranking ? (
        <RankingTab
          profile={profile}
          ranking={ranking}
          period={period}
          onChangePeriod={onChangePeriod}
        />
      ) : (
        <View className="items-center gap-2 rounded-[20px] border border-foreground/10 bg-surface px-5 py-10">
          <AppText variant="subtitle">랭킹을 불러오지 못했어요</AppText>
          <AppText color="muted">잠시 후 다시 시도해주세요.</AppText>
        </View>
      )}
    </>
  );
};

export default MyPage;
