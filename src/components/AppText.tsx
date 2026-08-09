import { colors } from "@/constants/colors";
import { Text, type TextProps, type TextStyle } from "react-native";

type AppTextVariant = "body" | "title" | "subtitle" | "caption" | "display";

type AppTextColor = "foreground" | "muted" | "primary";

type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  color?: AppTextColor;
  size?: number;
};

const variantStyles: Record<AppTextVariant, TextStyle> = {
  body: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "400",
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "600",
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
  },
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700",
  },
};

const colorStyles: Record<AppTextColor, TextStyle> = {
  foreground: {
    color: colors.foreground,
  },
  muted: {
    color: colors.muted,
  },
  primary: {
    color: colors.primary,
  },
};

export const AppText = ({
  variant = "body",
  color = "foreground",
  size,
  style,
  ...props
}: AppTextProps) => {
  return (
    <Text
      style={[
        variantStyles[variant],
        colorStyles[color],
        size != null && { fontSize: size },
        style,
      ]}
      {...props}
    />
  );
};
