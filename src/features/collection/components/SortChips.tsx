import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import type { PlaceSort } from "@/features/collection/types";
import { Pressable, View } from "react-native";

type SortChipsProps = {
  sort: PlaceSort;
  totalCount: number;
  onChangeSort: (sort: PlaceSort) => void;
};

const OPTIONS: { value: PlaceSort; label: (count: number) => string }[] = [
  { value: "all", label: (count) => `전체 ${count}` },
  { value: "recent", label: () => "최근순" },
  { value: "mostPhotos", label: () => "사진 많은순" },
];

export const SortChips = ({
  sort,
  totalCount,
  onChangeSort,
}: SortChipsProps) => {
  return (
    <View className="flex-row flex-wrap gap-2">
      {OPTIONS.map((option) => {
        const selected = option.value === sort;

        return (
          <Pressable
            key={option.value}
            testID={`dogam-sort-${option.value}`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label(totalCount)}
            className={[
              "rounded-full px-4 py-2",
              selected ? "bg-primary" : "bg-surface",
            ].join(" ")}
            onPress={() => onChangeSort(option.value)}
          >
            <AppText
              size={13}
              color={selected ? "foreground" : "muted"}
              style={{
                fontWeight: selected ? "800" : "600",
                // 선택 칩은 primary 배경 위라 어두운 글자를 쓴다.
                // AppText 는 공용 파일이라 색 목록을 늘리지 않고 토큰을 직접 준다.
                ...(selected ? { color: colors.background } : null),
              }}
            >
              {option.label(totalCount)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
};
