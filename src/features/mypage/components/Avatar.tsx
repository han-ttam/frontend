import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Image, View } from "react-native";

type AvatarProps = {
  uri: string | null;
  size: number;
  ringed?: boolean;
};

export const Avatar = ({ uri, size, ringed = false }: AvatarProps) => {
  return (
    <View
      className={[
        "overflow-hidden rounded-full bg-surface",
        ringed ? "border-2 border-primary" : "border border-foreground/15",
      ].join(" ")}
      style={{ width: size, height: size }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          className="h-full w-full"
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <ImagePlaceholder
          compact
          label="프로필 없음"
          className="h-full w-full"
        />
      )}
    </View>
  );
};
