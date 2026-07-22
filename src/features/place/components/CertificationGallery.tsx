import { AppText } from "@/components/AppText";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { colors } from "@/constants/colors";
import type { PlaceCertificationDto } from "@/lib/api/placeDetail";
import { Entypo } from "@expo/vector-icons";
import { Image, View } from "react-native";

type CertificationGalleryProps = {
  certifications: PlaceCertificationDto[];
  thumbSize: number;
  gap: number;
};

const EmptyState = () => {
  return (
    <View className="items-center gap-2 rounded-[20px] border border-foreground/15 bg-surface/80 px-5 py-8">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Entypo name="image" size={20} color={colors.primary} />
      </View>
      <AppText color="muted" style={{ textAlign: "center" }}>
        아직 인증 사진이 없어요.
      </AppText>
      <AppText color="muted" size={12} style={{ textAlign: "center" }}>
        첫 번째 인증의 주인공이 되어보세요!
      </AppText>
    </View>
  );
};

export const CertificationGallery = ({
  certifications,
  thumbSize,
  gap,
}: CertificationGalleryProps) => {
  return (
    <View className="gap-4">
      <AppText variant="subtitle">다른 여행자들의 인증 사진</AppText>

      {certifications.length > 0 ? (
        <View className="flex-row flex-wrap" style={{ gap }}>
          {certifications.map((certification, index) => (
            <View
              key={`${certification.userHandle ?? "traveler"}-${index}`}
              accessibilityLabel={
                certification.userHandle
                  ? `${certification.userHandle}님의 인증 사진`
                  : "여행자의 인증 사진"
              }
              style={{ width: thumbSize, height: thumbSize }}
            >
              {certification.imageUrl ? (
                <Image
                  source={{ uri: certification.imageUrl }}
                  className="rounded-xl"
                  style={{ width: thumbSize, height: thumbSize }}
                  resizeMode="cover"
                />
              ) : (
                <ImagePlaceholder
                  compact
                  label="준비중"
                  className="rounded-xl border border-foreground/10"
                  style={{ width: thumbSize, height: thumbSize }}
                />
              )}
            </View>
          ))}
        </View>
      ) : (
        <EmptyState />
      )}
    </View>
  );
};
