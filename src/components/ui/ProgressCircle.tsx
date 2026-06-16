import { colors } from "@/constants/colors";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { AppText } from "../AppText";

const ProgressCircle = ({ size = 72, progress = 0.2, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: "absolute" }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors["region-stroke"]}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>

      <AppText variant="subtitle" className="text-foreground">
        {Math.round(progress * 100)}%
      </AppText>
    </View>
  );
};

export default ProgressCircle;
