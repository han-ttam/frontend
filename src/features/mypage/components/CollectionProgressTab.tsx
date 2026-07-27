import { AppText } from "@/components/AppText";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { colors } from "@/constants/colors";
import { ProgressBar } from "@/features/mypage/components/ProgressBar";
import { toProgress } from "@/features/mypage/format";
import type {
  MypageCollectionItem,
  MypageCollections,
} from "@/features/mypage/types";
import { useMypageLayout } from "@/features/mypage/useMypageLayout";
import { Entypo } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";

const STAMP_SLOTS = 5;

type CollectionProgressTabProps = {
  collections: MypageCollections;
  onSelectCollection?: (collection: MypageCollectionItem) => void;
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

const CollectionCard = ({
  collection,
  onPress,
}: {
  collection: MypageCollectionItem;
  onPress?: () => void;
}) => {
  const { coverWidth, coverHeight, stampMaxSize, stampGap, isCompact } =
    useMypageLayout();
  const stamps = Array.from({ length: STAMP_SLOTS }, (_, index) => {
    return collection.thumbnails[index] ?? null;
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${collection.title} 도감 보기`}
      className="flex-row items-center gap-3 rounded-2xl border border-foreground/10 bg-surface p-3"
      onPress={onPress}
    >
      {collection.coverImageUrl ? (
        <Image
          source={{ uri: collection.coverImageUrl }}
          className="rounded-xl"
          style={{ width: coverWidth, height: coverHeight }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <ImagePlaceholder
          compact
          className="rounded-xl border border-foreground/10"
          style={{ width: coverWidth, height: coverHeight }}
        />
      )}

      <View className="flex-1 gap-2">
        <AppText variant="subtitle" size={isCompact ? 15 : 16} numberOfLines={1}>
          {collection.title}
        </AppText>

        <View className="flex-row items-center gap-2">
          <ProgressBar
            progress={toProgress(collection.filled, collection.total)}
            height={6}
            className="flex-1"
          />
          <View className="flex-row items-end">
            <AppText color="primary" size={13} style={{ fontWeight: "800" }}>
              {collection.filled}
            </AppText>
            <AppText color="muted" size={12}>
              {" "}
              / {collection.total}
            </AppText>
          </View>
        </View>

        <View className="flex-row" style={{ gap: stampGap }}>
          {stamps.map((uri, index) => (
            <StampSlot
              key={`${collection.id}-${index}`}
              uri={uri}
              maxSize={stampMaxSize}
            />
          ))}
        </View>
      </View>

      <Entypo name="chevron-right" size={22} color={colors.muted} />
    </Pressable>
  );
};

export const CollectionProgressTab = ({
  collections,
  onSelectCollection,
}: CollectionProgressTabProps) => {
  const { collected, total } = collections.overall;

  return (
    <View className="gap-4">
      <View className="gap-2">
        <View className="flex-row items-center justify-between gap-2">
          <AppText variant="subtitle" size={16} numberOfLines={1} className="shrink">
            전체 도감 진행 현황
          </AppText>
          <View className="flex-row items-end">
            <AppText color="primary" size={15} style={{ fontWeight: "800" }}>
              {collected}
            </AppText>
            <AppText color="muted" size={13}>
              {" "}
              / {total}
            </AppText>
          </View>
        </View>
        <ProgressBar progress={toProgress(collected, total)} height={7} />
      </View>

      {collections.items.length > 0 ? (
        <View className="gap-3">
          {collections.items.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onPress={() => onSelectCollection?.(collection)}
            />
          ))}
        </View>
      ) : (
        <View className="items-center gap-2 rounded-2xl border border-foreground/10 bg-surface px-5 py-8">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Entypo name="book" size={20} color={colors.primary} />
          </View>
          <AppText color="muted">아직 모은 도감이 없어요.</AppText>
        </View>
      )}
    </View>
  );
};
