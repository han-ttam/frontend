import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { ProgressBar } from "@/features/collection/components/ProgressBar";
import { toProgress } from "@/features/collection/format";
import type { DogamTheme, DogamThemes } from "@/features/collection/types";
import { useCollectionLayout } from "@/features/collection/useCollectionLayout";
import { Entypo } from "@expo/vector-icons";
import { Image, View } from "react-native";

const STAMP_SLOTS = 5;

type ThemeListProps = {
  themes: DogamThemes;
};

const StampSlot = ({ uri, maxSize }: { uri: string | null; maxSize: number }) => {
  const slotStyle = { flex: 1, maxWidth: maxSize, aspectRatio: 1 };

  if (!uri) {
    return (
      <View
        className="items-center justify-center rounded-xl border border-dashed border-foreground/25"
        style={slotStyle}
      >
        <AppText color="muted" size={14} style={{ fontWeight: "700" }}>
          ?
        </AppText>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      className="rounded-xl border border-foreground/10"
      style={slotStyle}
      resizeMode="cover"
      accessibilityIgnoresInvertColors
    />
  );
};

const ThemeCard = ({ theme }: { theme: DogamTheme }) => {
  const { stampMaxSize, stampGap, isCompact } = useCollectionLayout();
  const isComplete = theme.filled >= theme.total;
  const stamps = Array.from({ length: STAMP_SLOTS }, (_, index) => {
    return theme.thumbnails[index] ?? null;
  });

  return (
    <View className="gap-2.5 rounded-2xl border border-foreground/10 bg-surface p-4">
      <View className="flex-row items-center gap-2">
        <AppText
          variant="subtitle"
          size={isCompact ? 15 : 16}
          numberOfLines={1}
          className="flex-1"
        >
          {theme.title}
        </AppText>
        {isComplete ? (
          <View className="flex-row items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1">
            <Entypo name="check" size={12} color={colors.primary} />
            <AppText color="primary" size={11} style={{ fontWeight: "800" }}>
              완성
            </AppText>
          </View>
        ) : null}
      </View>

      <View className="flex-row items-center gap-2">
        <ProgressBar
          progress={toProgress(theme.filled, theme.total)}
          height={6}
          className="flex-1"
        />
        <View className="flex-row items-end">
          <AppText color="primary" size={13} style={{ fontWeight: "800" }}>
            {theme.filled}
          </AppText>
          <AppText color="muted" size={12}>
            {" "}
            / {theme.total}
          </AppText>
        </View>
      </View>

      <View className="flex-row" style={{ gap: stampGap }}>
        {stamps.map((uri, index) => (
          <StampSlot
            key={`${theme.collectionId}-${index}`}
            uri={uri}
            maxSize={stampMaxSize}
          />
        ))}
      </View>
    </View>
  );
};

export const ThemeList = ({ themes }: ThemeListProps) => {
  if (themes.items.length === 0) {
    return (
      <View className="items-center gap-2 rounded-2xl border border-foreground/10 bg-surface px-5 py-8">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Entypo name="price-tag" size={20} color={colors.primary} />
        </View>
        <AppText color="muted">아직 참여한 테마가 없어요.</AppText>
      </View>
    );
  }

  return (
    <View className="gap-3">
      {themes.items.map((theme) => (
        <ThemeCard key={theme.collectionId} theme={theme} />
      ))}
    </View>
  );
};
