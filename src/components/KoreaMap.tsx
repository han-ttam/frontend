import { colors } from "@/constants/colors";
import type { ComponentProps } from "react";
import { View } from "react-native";
import { Korea, type KoreaRegionId } from "./Korea";

type KoreaMapProps = Omit<
  ComponentProps<typeof Korea>,
  "onRegionPress" | "selectedRegionId"
> & {
  selectedRegionId?: KoreaRegionId | null;
  onRegionPress?: (regionId: KoreaRegionId | undefined) => void;
};

export const KoreaMap = ({
  defaultFill = colors["region-default"],
  regionColors,
  selectedRegionId,
  onRegionPress,
  ...props
}: KoreaMapProps) => {
  const handleRegionPress = (regionId: KoreaRegionId) => {
    onRegionPress?.(selectedRegionId === regionId ? undefined : regionId);
  };

  return (
    <>
      <Korea
        {...props}
        defaultFill={defaultFill}
        regionColors={regionColors}
        selectedRegionId={undefined}
        onRegionPress={handleRegionPress}
      />

      {selectedRegionId ? (
        <View pointerEvents="none" className="absolute inset-0">
          <Korea
            defaultFill="transparent"
            strokeColor="transparent"
            selectedRegionId={selectedRegionId}
          />
        </View>
      ) : null}
    </>
  );
};
