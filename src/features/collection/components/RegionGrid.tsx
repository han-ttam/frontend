import { AppText } from "@/components/AppText";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { colors } from "@/constants/colors";
import type { DogamRegion } from "@/features/collection/types";
import { useCollectionLayout } from "@/features/collection/useCollectionLayout";
import { Entypo } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";

type RegionGridProps = {
  regions: DogamRegion[];
  onSelectRegion?: (region: DogamRegion) => void;
  isRegionOpenable?: (region: DogamRegion) => boolean;
};

const RegionCard = ({
  region,
  onPress,
}: {
  region: DogamRegion;
  onPress?: () => void;
}) => {
  const { regionCardWidth, regionImageHeight, isCompact } =
    useCollectionLayout();
  const isLocked = region.locked;
  const canOpen = !isLocked && Boolean(onPress);

  const collectedBadge = (
    <View className="h-7 w-7 items-center justify-center rounded-full border border-primary/60">
      <Entypo name="check" size={14} color={colors.primary} />
    </View>
  );

  const stats = (
    <View className="flex-row items-center gap-1.5">
      <AppText color="primary" size={13} style={{ fontWeight: "800" }}>
        {region.percent}%
      </AppText>
      <AppText color="muted" size={12} numberOfLines={1}>
        {region.collected} / {region.total}
        {isCompact ? "" : " 곳"}
      </AppText>
    </View>
  );

  const lockedNote = (
    <AppText color="muted" size={11} numberOfLines={isCompact ? 2 : 1}>
      잠금 해제 후 수집할 수 있어요
    </AppText>
  );

  const name = (
    <AppText
      size={isCompact ? 14 : 15}
      numberOfLines={1}
      color={isLocked ? "muted" : "foreground"}
      style={{ fontWeight: "700" }}
    >
      {region.name}
    </AppText>
  );

  return (
    <Pressable
      testID={`collection-region-${region.provinceCode}`}
      accessibilityRole={canOpen ? "button" : "image"}
      accessibilityState={{ disabled: !canOpen }}
      accessibilityLabel={
        isLocked
          ? `${region.name} 잠김`
          : `${region.name} ${region.percent}% 수집`
      }
      disabled={!canOpen}
      className="overflow-hidden rounded-2xl border border-foreground/10 bg-surface"
      style={{ width: regionCardWidth, opacity: isLocked ? 0.55 : 1 }}
      onPress={onPress}
    >
      <View style={{ height: regionImageHeight }}>
        {region.imageUrl ? (
          <Image
            source={{ uri: region.imageUrl }}
            className="h-full w-full"
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <ImagePlaceholder compact className="h-full w-full" />
        )}

        {isLocked ? (
          <View className="absolute inset-0 items-center justify-center bg-background/70">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-surface/90">
              <Entypo name="lock" size={17} color={colors.foreground} />
            </View>
          </View>
        ) : null}
      </View>

      {isCompact ? (
        <View className="gap-1 px-3 py-2.5">
          {name}
          <View className="flex-row items-center justify-between gap-1">
            {isLocked ? lockedNote : stats}
            {isLocked ? null : collectedBadge}
          </View>
        </View>
      ) : (
        <View className="flex-row items-center gap-2 px-3 py-2.5">
          <View className="flex-1 gap-1">
            {name}
            {isLocked ? lockedNote : stats}
          </View>
          {isLocked ? null : collectedBadge}
        </View>
      )}
    </Pressable>
  );
};

export const RegionGrid = ({
  regions,
  onSelectRegion,
  isRegionOpenable,
}: RegionGridProps) => {
  const { gridGap } = useCollectionLayout();

  if (regions.length === 0) {
    return (
      <View className="items-center gap-2 rounded-2xl border border-foreground/10 bg-surface px-5 py-8">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Entypo name="map" size={20} color={colors.primary} />
        </View>
        <AppText color="muted">아직 수집한 지역이 없어요.</AppText>
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap" style={{ gap: gridGap }}>
      {regions.map((region) => {
        const openable =
          !region.locked && (isRegionOpenable?.(region) ?? true);

        return (
          <RegionCard
            key={region.provinceCode}
            region={region}
            onPress={
              openable && onSelectRegion
                ? () => onSelectRegion(region)
                : undefined
            }
          />
        );
      })}
    </View>
  );
};
