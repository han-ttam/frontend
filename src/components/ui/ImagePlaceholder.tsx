import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { Entypo } from "@expo/vector-icons";
import { View, type ViewProps } from "react-native";

type ImagePlaceholderProps = ViewProps & {
  label?: string;
};

export const ImagePlaceholder = ({
  label = "이미지 준비중",
  style,
  className,
  ...props
}: ImagePlaceholderProps) => {
  return (
    <View
      className={[
        "items-center justify-center gap-2 overflow-hidden bg-surface",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={[{ borderColor: "rgba(244, 245, 244, 0.12)" }, style]}
      {...props}
    >
      <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10">
        <Entypo name="image" size={20} color={colors.primary} />
      </View>
      <AppText color="muted" size={13} style={{ fontWeight: "700" }}>
        {label}
      </AppText>
    </View>
  );
};
