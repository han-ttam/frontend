import { colors } from "@/constants/colors";
import { useEffect } from "react";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { AppText } from "../AppText";

type ProgressCircleProps = {
  size?: number;
  progress?: number; // 0 ~ 1
  strokeWidth?: number;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const clampProgress = (value: number) => {
  return Math.min(1, Math.max(0, value));
};

const ProgressCircle = ({
  size = 72,
  progress = 0,
  strokeWidth = 6,
}: ProgressCircleProps) => {
  const safeProgress = clampProgress(progress);
  const isComplete = safeProgress === 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProgress = useSharedValue(safeProgress);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    animatedProgress.value = withTiming(safeProgress, {
      duration: isComplete ? 450 : 120,
      easing: Easing.out(Easing.cubic),
    });
  }, [animatedProgress, isComplete, safeProgress]);

  useEffect(() => {
    if (isComplete) {
      cancelAnimation(rotation);
      scale.value = withSequence(
        withTiming(1.08, { duration: 140 }),
        withTiming(1, { duration: 180 }),
      );
    }
  }, [isComplete, rotation, scale]);

  useEffect(() => {
    if (isComplete) {
      return;
    }

    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1800,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    return () => {
      cancelAnimation(rotation);
    };
  }, [isComplete, rotation]);

  const progressCircleProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: circumference * (1 - animatedProgress.value),
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const spinnerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        },
        containerStyle,
      ]}
    >
      <Animated.View style={[{ position: "absolute" }, spinnerStyle]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.surface}
            strokeWidth={strokeWidth}
            fill="none"
          />

          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={progressCircleProps}
            rotation={-90}
            originX={size / 2}
            originY={size / 2}
          />
        </Svg>
      </Animated.View>

      <AppText
        variant="subtitle"
        style={{
          fontSize: 14,
          textAlign: "center",
          fontVariant: ["tabular-nums"],
        }}
      >
        {Math.round(safeProgress * 100)}%
      </AppText>
    </Animated.View>
  );
};

export default ProgressCircle;
