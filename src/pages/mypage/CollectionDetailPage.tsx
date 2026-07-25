import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { CollectionDetailHeader } from "@/features/mypage/components/CollectionDetailHeader";
import { CollectionMessage } from "@/features/mypage/components/CollectionMessage";
import { CollectionPlaceRow } from "@/features/mypage/components/CollectionPlaceRow";
import { CollectionSummaryCard } from "@/features/mypage/components/CollectionSummaryCard";
import {
  countCollected,
  toCollectionTypeLabel,
} from "@/features/mypage/format";
import { useCollectionDetailData } from "@/features/mypage/useCollectionDetailData";
import { useMypageLayout } from "@/features/mypage/useMypageLayout";
import { ApiError } from "@/lib/api/client";
import { Entypo } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

const NOT_FOUND_MESSAGE = "Collection not found";
const SKELETON_ROWS = [0, 1, 2];

/** 없는 모음(목데이터 resolver / 서버 404)은 "찾을 수 없어요" 경로로 보낸다. */
const isNotFoundError = (error: unknown) => {
  if (error instanceof ApiError) {
    return error.status === 404;
  }

  return error instanceof Error && error.message === NOT_FOUND_MESSAGE;
};

const goBack = () => {
  router.back();
};

const PageScroll = ({ children }: { children: React.ReactNode }) => {
  const { maxContentWidth, isCompact } = useMypageLayout();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View
        className={["gap-5 pb-10 pt-5", isCompact ? "px-4" : "px-5"].join(" ")}
        style={{ width: "100%", maxWidth: maxContentWidth, alignSelf: "center" }}
      >
        {children}
      </View>
    </ScrollView>
  );
};

const LoadingRows = () => {
  const { rowThumbSize } = useMypageLayout();

  return (
    <View accessible accessibilityLabel="목록을 불러오는 중" className="gap-3">
      {SKELETON_ROWS.map((row) => (
        <View
          key={row}
          className="rounded-2xl bg-foreground/5"
          style={{ height: rowThumbSize + 24 }}
        />
      ))}
    </View>
  );
};

const CollectionDetailPage = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data, error, isLoading, reload } = useCollectionDetailData(id);

  if (!id || isNotFoundError(error)) {
    return (
      <CollectionMessage
        title="모음을 찾을 수 없어요"
        description="모음 정보가 없어 목록을 열 수 없습니다."
        onBack={goBack}
      />
    );
  }

  if (error) {
    return (
      <CollectionMessage
        title="목록을 불러오지 못했어요"
        description="잠시 후 다시 시도해 주세요."
        onBack={goBack}
        onRetry={reload}
      />
    );
  }

  if (isLoading || !data) {
    return (
      <PageScroll>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          className="h-11 w-11 items-center justify-center rounded-full bg-surface"
          onPress={goBack}
        >
          <Entypo name="chevron-left" size={24} color={colors.foreground} />
        </Pressable>
        <LoadingRows />
      </PageScroll>
    );
  }

  const collectedCount = countCollected(data.items);
  const totalCount = data.items.length;

  return (
    <PageScroll>
      <CollectionDetailHeader
        typeLabel={toCollectionTypeLabel(data.type)}
        title={data.title}
        description={data.description}
        onBack={goBack}
      />

      <CollectionSummaryCard collected={collectedCount} total={totalCount} />

      {totalCount > 0 ? (
        <View className="gap-3">
          {data.items.map((place) => (
            <CollectionPlaceRow
              key={place.placeId}
              place={place}
              onPress={() => {
                router.push({
                  pathname: "/map/list/[id]",
                  params: { id: place.placeId },
                });
              }}
            />
          ))}
        </View>
      ) : (
        <View className="items-center gap-2 rounded-2xl border border-foreground/10 bg-surface px-5 py-8">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Entypo name="location-pin" size={20} color={colors.primary} />
          </View>
          <AppText color="muted">아직 등록된 명소가 없어요.</AppText>
        </View>
      )}
    </PageScroll>
  );
};

export default CollectionDetailPage;
