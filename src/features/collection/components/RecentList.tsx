import { AppText } from "@/components/AppText";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { colors } from "@/constants/colors";
import {
  formatCollectedDate,
  formatCollectedRelative,
} from "@/features/collection/format";
import type { DogamRecent, DogamRecentItem } from "@/features/collection/types";
import { useCollectionLayout } from "@/features/collection/useCollectionLayout";
import { Entypo } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";

type RecentListProps = {
  recent: DogamRecent;
  onSelectPlace?: (item: DogamRecentItem) => void;
};

const RecentRow = ({
  item,
  isLast,
  onPress,
}: {
  item: DogamRecentItem;
  isLast: boolean;
  onPress?: () => void;
}) => {
  const { recentThumbSize } = useCollectionLayout();
  const relative = formatCollectedRelative(item.collectedAt);

  return (
    <View className="flex-row gap-3">
      <View className="items-center pt-1">
        <View className="h-3 w-3 rounded-full border-2 border-primary bg-background" />
        {isLast ? null : <View className="w-px flex-1 bg-foreground/15" />}
      </View>

      <Pressable
        testID={`collection-recent-${item.placeId}`}
        accessibilityRole="button"
        accessibilityLabel={`${item.name} 상세 보기`}
        className="mb-3 flex-1 flex-row items-center gap-3 rounded-2xl border border-foreground/10 bg-surface p-3"
        onPress={onPress}
      >
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            className="rounded-xl"
            style={{ width: recentThumbSize, height: recentThumbSize }}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <ImagePlaceholder
            compact
            label="인증 사진 없음"
            className="rounded-xl border border-foreground/10"
            style={{ width: recentThumbSize, height: recentThumbSize }}
          />
        )}

        <View className="flex-1 gap-1">
          <AppText size={15} numberOfLines={1} style={{ fontWeight: "700" }}>
            {item.name}
          </AppText>
          <View className="flex-row items-center gap-1.5">
            {relative ? (
              <View className="rounded-full bg-primary/15 px-2 py-0.5">
                <AppText color="primary" size={11} style={{ fontWeight: "800" }}>
                  {relative}
                </AppText>
              </View>
            ) : null}
            <AppText color="muted" size={12}>
              {formatCollectedDate(item.collectedAt)} 수집
            </AppText>
          </View>
        </View>

        <Entypo name="chevron-right" size={20} color={colors.muted} />
      </Pressable>
    </View>
  );
};

export const RecentList = ({ recent, onSelectPlace }: RecentListProps) => {
  if (recent.items.length === 0) {
    return (
      <View className="items-center gap-2 rounded-2xl border border-foreground/10 bg-surface px-5 py-8">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Entypo name="back-in-time" size={20} color={colors.primary} />
        </View>
        <AppText color="muted">아직 수집한 장소가 없어요.</AppText>
      </View>
    );
  }

  return (
    <View>
      {recent.items.map((item, index) => (
        <RecentRow
          key={item.placeId}
          item={item}
          isLast={index === recent.items.length - 1}
          onPress={onSelectPlace ? () => onSelectPlace(item) : undefined}
        />
      ))}
    </View>
  );
};
