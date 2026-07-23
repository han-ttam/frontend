import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import type { DogamTab } from "@/features/collection/types";
import { useCollectionLayout } from "@/features/collection/useCollectionLayout";
import { Entypo } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

const TABS = [
  { id: "regions", label: "지역별", icon: "location-pin" },
  { id: "themes", label: "테마별", icon: "price-tag" },
  { id: "recent", label: "최근 수집", icon: "back-in-time" },
] as const satisfies readonly {
  id: DogamTab;
  label: string;
  icon: keyof typeof Entypo.glyphMap;
}[];

type CollectionTabsProps = {
  tab: DogamTab;
  onChangeTab: (tab: DogamTab) => void;
};

export const CollectionTabs = ({ tab, onChangeTab }: CollectionTabsProps) => {
  const { isCompact } = useCollectionLayout();

  return (
    <View className="flex-row rounded-2xl border border-foreground/10 bg-surface p-1">
      {TABS.map((item) => {
        const isSelected = tab === item.id;

        return (
          <Pressable
            key={item.id}
            testID={`collection-tab-${item.id}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${item.label} 탭`}
            className={[
              "flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5",
              isSelected ? "bg-background" : "",
            ].join(" ")}
            onPress={() => onChangeTab(item.id)}
          >
            <Entypo
              name={item.icon}
              size={isCompact ? 13 : 15}
              color={isSelected ? colors.primary : colors.muted}
            />
            <AppText
              color={isSelected ? "primary" : "muted"}
              size={isCompact ? 13 : 14}
              numberOfLines={1}
              style={{ fontWeight: "700" }}
            >
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
};
