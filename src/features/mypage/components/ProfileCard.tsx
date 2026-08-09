import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { Avatar } from "@/features/mypage/components/Avatar";
import { ProgressBar } from "@/features/mypage/components/ProgressBar";
import {
  formatNumber,
  formatRank,
  toProgress,
} from "@/features/mypage/format";
import type { MypageProfile } from "@/features/mypage/types";
import { useMypageLayout } from "@/features/mypage/useMypageLayout";
import { Entypo, Feather } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

type ProfileCardProps = {
  profile: MypageProfile;
  collectedCount: number;
  totalCount: number;
};

const StatColumn = ({
  label,
  value,
  unit,
  caption,
  progress,
  showInfo = false,
  divided = false,
}: {
  label: string;
  value: string;
  unit?: string;
  caption: string;
  progress?: number;
  showInfo?: boolean;
  divided?: boolean;
}) => {
  const { statValueSize, statLabelSize } = useMypageLayout();

  return (
    <View
      className={[
        "flex-1 items-center gap-1.5 px-1.5",
        divided ? "border-l border-foreground/10" : "",
      ].join(" ")}
    >
      <View className="flex-row items-center gap-1">
        <AppText
          color="muted"
          size={statLabelSize}
          numberOfLines={1}
          style={{ fontWeight: "600" }}
        >
          {label}
        </AppText>
        {showInfo ? (
          <Entypo name="info-with-circle" size={12} color={colors.muted} />
        ) : null}
      </View>
      <View className="flex-row items-end">
        <AppText
          color="primary"
          numberOfLines={1}
          style={{
            fontSize: statValueSize,
            lineHeight: statValueSize + 6,
            fontWeight: "800",
          }}
        >
          {value}
        </AppText>
        {unit ? (
          <AppText
            color="primary"
            style={{
              fontSize: Math.round(statValueSize * 0.54),
              lineHeight: statValueSize - 4,
              fontWeight: "800",
            }}
          >
            {unit}
          </AppText>
        ) : null}
      </View>
      {progress != null ? (
        <ProgressBar progress={progress} height={5} className="w-full" />
      ) : null}
      <AppText color="muted" size={12} numberOfLines={1}>
        {caption}
      </AppText>
    </View>
  );
};

export const ProfileCard = ({
  profile,
  collectedCount,
  totalCount,
}: ProfileCardProps) => {
  const { profileAvatarSize, isCompact } = useMypageLayout();
  const expProgress = toProgress(profile.exp, profile.expForNextLevel);

  return (
    <View className="gap-4 rounded-3xl border border-foreground/15 bg-surface p-4">
      <View className="flex-row items-center gap-4">
        <Avatar uri={profile.avatarUrl} size={profileAvatarSize} ringed />

        <View className="flex-1 gap-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <AppText
              variant="subtitle"
              size={isCompact ? 18 : 20}
              numberOfLines={1}
              className="shrink"
            >
              {profile.displayName}
            </AppText>
            <View className="rounded-full bg-primary/15 px-2.5 py-1">
              <AppText color="primary" size={12} style={{ fontWeight: "800" }}>
                Lv. {profile.level}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="프로필 수정"
              hitSlop={8}
            >
              <Feather name="edit-2" size={14} color={colors.muted} />
            </Pressable>
          </View>

          {profile.bio ? (
            <AppText color="muted" size={13} numberOfLines={2}>
              {profile.bio}
            </AppText>
          ) : null}

          {profile.location ? (
            <View className="flex-row items-center gap-1">
              <Entypo name="location-pin" size={14} color={colors.muted} />
              <AppText color="muted" size={12} numberOfLines={1} className="shrink">
                {profile.location}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>

      <View className="gap-1.5">
        <AppText color="muted" size={12} style={{ fontWeight: "600" }}>
          {formatNumber(profile.exp)} / {formatNumber(profile.expForNextLevel)}{" "}
          EXP
        </AppText>
        <ProgressBar progress={expProgress} height={7} />
      </View>

      <View className="flex-row border-t border-foreground/10 pt-4">
        <StatColumn
          label="도감 진행률"
          value={`${profile.dogamPercent}`}
          unit="%"
          caption={`${collectedCount} / ${totalCount}`}
          progress={toProgress(collectedCount, totalCount)}
        />
        <StatColumn
          label="방문 장소"
          value={formatNumber(profile.visitedCount)}
          caption={`/ ${formatNumber(totalCount)}`}
          divided
        />
        <StatColumn
          label="전국 랭킹"
          value={formatRank(profile.nationalRank)}
          unit={profile.nationalRank == null ? undefined : "위"}
          caption={`/ ${formatNumber(profile.totalUsers)}명`}
          showInfo
          divided
        />
      </View>
    </View>
  );
};
