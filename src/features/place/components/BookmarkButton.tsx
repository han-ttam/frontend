import { colors } from "@/constants/colors";
import { Entypo } from "@expo/vector-icons";
import { Pressable } from "react-native";

type BookmarkButtonProps = {
  isBookmarked: boolean;
  isDisabled: boolean;
  onPress: () => void;
};

export const BookmarkButton = ({
  isBookmarked,
  isDisabled,
  onPress,
}: BookmarkButtonProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isBookmarked ? "찜 해제" : "찜하기"}
      accessibilityState={{ disabled: isDisabled, selected: isBookmarked }}
      className="h-11 w-11 items-center justify-center rounded-full bg-surface"
      disabled={isDisabled}
      onPress={onPress}
    >
      <Entypo
        name={isBookmarked ? "heart" : "heart-outlined"}
        size={24}
        color={isBookmarked ? colors.primary : colors.muted}
      />
    </Pressable>
  );
};
