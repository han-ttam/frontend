import { AppText } from "@/components/AppText";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { colors } from "@/constants/colors";
import type { PlaceCompositionDto } from "@/lib/api/placeDetail";
import { Entypo } from "@expo/vector-icons";
import { Image, View } from "react-native";

type CompositionGuideProps = {
  compositions: PlaceCompositionDto[];
  cardWidth: number;
  imageHeight: number;
  gap: number;
};

/** 첫 번째 구도에만 촬영 프레임(점선)을 겹쳐 어떻게 담으라는 건지 보여준다. */
const FrameOverlay = () => {
  return (
    <View
      style={{
        position: "absolute",
        top: "18%",
        bottom: "18%",
        left: "14%",
        right: "14%",
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "rgba(244, 245, 244, 0.85)",
        borderRadius: 4,
      }}
    />
  );
};

const EmptyState = () => {
  return (
    <View className="items-center gap-2 rounded-[20px] border border-foreground/15 bg-surface/80 px-5 py-8">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Entypo name="camera" size={20} color={colors.primary} />
      </View>
      <AppText color="muted" style={{ textAlign: "center" }}>
        아직 등록된 구도 가이드가 없어요.
      </AppText>
      <AppText color="muted" size={12} style={{ textAlign: "center" }}>
        먼저 인증해서 다른 여행자에게 좋은 구도를 알려주세요!
      </AppText>
    </View>
  );
};

export const CompositionGuide = ({
  compositions,
  cardWidth,
  imageHeight,
  gap,
}: CompositionGuideProps) => {
  return (
    <View className="gap-4">
      <AppText variant="subtitle">인증에 도움이 되는 구도 추천</AppText>

      {compositions.length > 0 ? (
        <View className="flex-row flex-wrap" style={{ gap }}>
          {compositions.map((composition, index) => (
            <View
              key={`${composition.seq}-${composition.title}`}
              className="gap-2 rounded-[18px] border border-foreground/15 bg-surface/80 p-3"
              style={{ width: cardWidth }}
            >
              <View className="flex-row items-center gap-2">
                <View className="h-5 w-5 items-center justify-center rounded-md bg-primary">
                  <AppText
                    size={12}
                    style={{ color: colors.background, fontWeight: "800" }}
                  >
                    {index + 1}
                  </AppText>
                </View>
                <AppText size={13} style={{ fontWeight: "700", flex: 1 }} numberOfLines={1}>
                  {composition.title}
                </AppText>
              </View>

              <View style={{ height: imageHeight }}>
                {composition.exampleImageUrl ? (
                  <Image
                    source={{ uri: composition.exampleImageUrl }}
                    className="rounded-xl"
                    style={{ width: "100%", height: imageHeight }}
                    resizeMode="cover"
                  />
                ) : (
                  <ImagePlaceholder
                    compact
                    label="예시 준비중"
                    className="rounded-xl border border-foreground/10"
                    style={{ width: "100%", height: imageHeight }}
                  />
                )}
                {index === 0 ? <FrameOverlay /> : null}
              </View>

              {composition.description ? (
                <AppText color="muted" size={12} numberOfLines={2}>
                  {composition.description}
                </AppText>
              ) : null}
            </View>
          ))}
        </View>
      ) : (
        <EmptyState />
      )}
    </View>
  );
};
