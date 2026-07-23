import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { Entypo } from "@expo/vector-icons";
import { View, type ViewProps } from "react-native";

type ImagePlaceholderProps = ViewProps & {
  compact?: boolean;
  label?: string;
};

export const ImagePlaceholder = ({
  compact = false,
  label = "이미지 준비중",
  style,
  className,
  ...props
}: ImagePlaceholderProps) => {
  return (
    <View
      className={[
        "items-center justify-center overflow-hidden bg-surface",
        compact ? "gap-1" : "gap-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={[{ borderColor: "rgba(244, 245, 244, 0.12)" }, style]}
      {...props}
    >
      <View
        className={[
          "items-center justify-center rounded-full bg-primary/10",
          compact ? "h-5 w-5" : "h-9 w-9",
        ].join(" ")}
      >
        <Entypo name="image" size={compact ? 12 : 20} color={colors.primary} />
      </View>
      <AppText
        color="muted"
        size={compact ? 10 : 13}
        style={{
          fontWeight: "700",
          lineHeight: compact ? 12 : 18,
          textAlign: "center",
        }}
      >
        {label}
      </AppText>
    </View>
  );
};
