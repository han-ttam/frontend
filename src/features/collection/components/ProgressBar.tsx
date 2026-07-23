import { clampProgress } from "@/features/collection/format";
import { View, type ViewProps } from "react-native";

type ProgressBarProps = ViewProps & {
  progress: number;
  height?: number;
};

export const ProgressBar = ({
  progress,
  height = 8,
  className,
  style,
  ...props
}: ProgressBarProps) => {
  return (
    <View
      className={["overflow-hidden rounded-full bg-foreground/10", className]
        .filter(Boolean)
        .join(" ")}
      style={[{ height }, style]}
      {...props}
    >
      <View
        className="h-full rounded-full bg-primary"
        style={{ width: `${clampProgress(progress) * 100}%` }}
      />
    </View>
  );
};
