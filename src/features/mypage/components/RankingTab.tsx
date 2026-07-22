import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { Avatar } from "@/features/mypage/components/Avatar";
import { TopPercentRing } from "@/features/mypage/components/TopPercentRing";
import { formatNumber } from "@/features/mypage/format";
import type {
  MypageProfile,
  MypageRanking,
  RankingPeriod,
  RankingTraveler,
} from "@/features/mypage/types";
import { useMypageLayout } from "@/features/mypage/useMypageLayout";
import { Entypo, Feather } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

const PERIODS = [
  { id: "CUMULATIVE", label: "전국 누적", icon: "location-pin" },
  { id: "MONTHLY", label: "이번 달", icon: "calendar" },
] as const;

const PODIUM_ORDER = [2, 1, 3] as const;

type RankingTabProps = {
  profile: MypageProfile;
  ranking: MypageRanking;
  period: RankingPeriod;
  onChangePeriod: (period: RankingPeriod) => void;
};

const PeriodToggle = ({
  period,
  onChangePeriod,
}: Pick<RankingTabProps, "period" | "onChangePeriod">) => {
  return (
    <View className="flex-row flex-wrap gap-2">
      {PERIODS.map((item) => {
        const isSelected = period === item.id;

        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${item.label} 랭킹 보기`}
            className={[
              "flex-row items-center gap-1.5 rounded-full border px-4 py-2",
              isSelected
                ? "border-primary bg-primary/10"
                : "border-foreground/15 bg-surface",
            ].join(" ")}
            onPress={() => onChangePeriod(item.id)}
          >
            <Entypo
              name={item.icon}
              size={15}
              color={isSelected ? colors.primary : colors.muted}
            />
            <AppText
              color={isSelected ? "primary" : "muted"}
              size={13}
              style={{ fontWeight: "700" }}
            >
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
};

const PodiumItem = ({ traveler }: { traveler: RankingTraveler }) => {
  const { podiumAvatarSize, podiumLeaderAvatarSize, isCompact } =
    useMypageLayout();
  const isFirst = traveler.rank === 1;

  return (
    <View
      className="flex-1 items-center gap-2"
      style={{ paddingTop: isFirst ? 0 : 14 }}
    >
      <AppText
        color={isFirst ? "primary" : "muted"}
        size={isFirst ? 15 : 13}
        style={{ fontWeight: "800" }}
      >
        {traveler.rank}
      </AppText>
      <Avatar
        uri={traveler.avatarUrl}
        size={isFirst ? podiumLeaderAvatarSize : podiumAvatarSize}
        ringed={isFirst}
      />
      <AppText
        size={isCompact ? 13 : 14}
        numberOfLines={1}
        style={{ fontWeight: "700" }}
      >
        {traveler.handle}
      </AppText>
      <View className="flex-row items-end">
        <AppText
          color="primary"
          size={isCompact ? 14 : 15}
          style={{ fontWeight: "800" }}
        >
          {formatNumber(traveler.score)}
        </AppText>
        <AppText color="muted" size={12}>
          점
        </AppText>
      </View>
    </View>
  );
};

const LeaderboardRow = ({ traveler }: { traveler: RankingTraveler }) => {
  const { rankColumnWidth, scoreColumnWidth, rowAvatarSize, tableTextSize } =
    useMypageLayout();

  return (
    <View className="flex-row items-center border-t border-foreground/10 px-3 py-3">
      <AppText
        color="muted"
        size={tableTextSize}
        style={{ width: rankColumnWidth }}
      >
        {traveler.rank}
      </AppText>
      <View className="flex-1 flex-row items-center gap-2">
        <Avatar uri={traveler.avatarUrl} size={rowAvatarSize} />
        <AppText size={tableTextSize + 1} numberOfLines={1} className="shrink">
          {traveler.handle}
        </AppText>
      </View>
      <AppText
        size={tableTextSize}
        style={{ width: scoreColumnWidth, textAlign: "right" }}
      >
        {formatNumber(traveler.score)}점
      </AppText>
      <AppText
        color="muted"
        size={tableTextSize}
        style={{ width: scoreColumnWidth, textAlign: "right" }}
      >
        {traveler.dogamPercent}%
      </AppText>
    </View>
  );
};

const MyRankRow = ({
  profile,
  me,
}: {
  profile: MypageProfile;
  me: MypageRanking["me"];
}) => {
  const { rankColumnWidth, scoreColumnWidth, rowAvatarSize, tableTextSize } =
    useMypageLayout();

  return (
    <View className="gap-1 rounded-2xl border border-primary bg-primary/10 px-3 py-3">
      <View className="flex-row items-center">
        <AppText
          color="primary"
          size={tableTextSize}
          style={{ width: rankColumnWidth, fontWeight: "800" }}
        >
          {me.rank}
        </AppText>
        <View className="flex-1 flex-row items-center gap-2">
          <Avatar uri={profile.avatarUrl} size={rowAvatarSize} />
          <AppText
            size={tableTextSize + 1}
            numberOfLines={1}
            className="shrink"
            style={{ fontWeight: "700" }}
          >
            {profile.displayName}
          </AppText>
          <View className="rounded-md bg-primary/20 px-1.5 py-0.5">
            <AppText color="primary" size={11} style={{ fontWeight: "800" }}>
              나
            </AppText>
          </View>
        </View>
        <AppText
          color="primary"
          size={tableTextSize}
          style={{
            width: scoreColumnWidth,
            textAlign: "right",
            fontWeight: "800",
          }}
        >
          {formatNumber(me.score)}점
        </AppText>
        <AppText
          color="primary"
          size={tableTextSize}
          style={{
            width: scoreColumnWidth,
            textAlign: "right",
            fontWeight: "800",
          }}
        >
          {me.dogamPercent}%
        </AppText>
      </View>

      <View
        className="flex-row items-center gap-1"
        style={{ paddingLeft: rankColumnWidth }}
      >
        <Feather name="chevron-up" size={13} color={colors.primary} />
        <AppText color="primary" size={12}>
          다음 순위까지 {formatNumber(me.pointsToNext)}점
        </AppText>
      </View>
    </View>
  );
};

export const RankingTab = ({
  profile,
  ranking,
  period,
  onChangePeriod,
}: RankingTabProps) => {
  const {
    ringSize,
    topPercentTitleSize,
    rankColumnWidth,
    scoreColumnWidth,
    tableHeaderSize,
    isCompact,
  } = useMypageLayout();
  const podium = PODIUM_ORDER.map((rank) => {
    return ranking.top3.find((traveler) => traveler.rank === rank);
  }).filter((traveler): traveler is RankingTraveler => Boolean(traveler));

  return (
    <View className="gap-4">
      <PeriodToggle period={period} onChangePeriod={onChangePeriod} />

      <View className="flex-row items-center gap-3 rounded-3xl border border-foreground/15 bg-surface p-4">
        <View className="flex-1 gap-1">
          <AppText color="muted" size={13} numberOfLines={1}>
            {profile.displayName}님은
          </AppText>
          <View className="flex-row flex-wrap items-end gap-x-1">
            <AppText
              style={{
                fontSize: topPercentTitleSize,
                lineHeight: topPercentTitleSize + 8,
                fontWeight: "800",
              }}
            >
              전국 상위
            </AppText>
            <View className="flex-row items-end">
              <AppText
                color="primary"
                style={{
                  fontSize: topPercentTitleSize + 4,
                  lineHeight: topPercentTitleSize + 10,
                  fontWeight: "800",
                }}
              >
                {ranking.topPercent}
              </AppText>
              <AppText
                color="primary"
                style={{
                  fontSize: Math.round(topPercentTitleSize * 0.65),
                  lineHeight: topPercentTitleSize + 2,
                  fontWeight: "800",
                }}
              >
                %
              </AppText>
            </View>
          </View>
          <AppText color="muted" size={isCompact ? 12 : 13}>
            {isCompact
              ? "멋진 여행 기록을\n이어가고 있어요!"
              : "멋진 여행 기록을 이어가고 있어요!"}
          </AppText>
        </View>

        <TopPercentRing topPercent={ranking.topPercent} size={ringSize} />
      </View>

      {podium.length > 0 ? (
        <View className="flex-row items-end justify-between gap-2 rounded-3xl border border-foreground/15 bg-surface px-3 py-4">
          {podium.map((traveler) => (
            <PodiumItem key={traveler.rank} traveler={traveler} />
          ))}
        </View>
      ) : null}

      <View className="overflow-hidden rounded-2xl border border-foreground/15 bg-surface">
        <View className="flex-row items-center px-3 py-2.5">
          <AppText
            color="muted"
            size={tableHeaderSize}
            style={{ width: rankColumnWidth }}
          >
            순위
          </AppText>
          <AppText color="muted" size={tableHeaderSize} className="flex-1">
            여행자
          </AppText>
          <AppText
            color="muted"
            size={tableHeaderSize}
            numberOfLines={1}
            style={{ width: scoreColumnWidth, textAlign: "right" }}
          >
            {isCompact ? "점수" : "여행 점수"}
          </AppText>
          <AppText
            color="muted"
            size={tableHeaderSize}
            numberOfLines={1}
            style={{ width: scoreColumnWidth, textAlign: "right" }}
          >
            {isCompact ? "진행률" : "도감 진행률"}
          </AppText>
        </View>

        {ranking.leaderboard.items.map((traveler) => (
          <LeaderboardRow key={traveler.rank} traveler={traveler} />
        ))}

        <MyRankRow profile={profile} me={ranking.me} />
      </View>
    </View>
  );
};
