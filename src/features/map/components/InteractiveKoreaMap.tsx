import { type KoreaRegionId } from "@/components/Korea";
import { KoreaMap } from "@/components/KoreaMap";
import RegionMarker from "@/components/ui/RegionMarker";
import { colors } from "@/constants/colors";
import { regionLabels, regions, type RegionId } from "@/constants/regions";
import { Pressable, View, type ViewProps } from "react-native";

type InteractiveKoreaMapProps = ViewProps & {
  selectedRegionId?: RegionId;
  regionColors?: Partial<Record<KoreaRegionId, string>>;
  regionPercents?: Partial<Record<RegionId, number>>;
  onRegionPress?: (regionId: RegionId | undefined) => void;
};

const getRegionAccessibilityLabel = (regionId: RegionId) =>
  `${regionLabels[regionId]} 지역 선택`;

export const InteractiveKoreaMap = ({
  selectedRegionId,
  regionColors,
  regionPercents = {},
  onRegionPress,
  className,
  ...props
}: InteractiveKoreaMapProps) => {
  return (
    <View
      {...props}
      className={["relative w-full aspect-[800/1080]", className]
        .filter(Boolean)
        .join(" ")}
    >
      <KoreaMap
        regionColors={regionColors}
        defaultFill={colors["region-default"]}
        selectedRegionId={selectedRegionId}
        onRegionPress={(regionId) => onRegionPress?.(regionId)}
      />

      {regions.map((region) => (
        <Pressable
          key={region.id}
          testID={`region-hit-zone-${region.id}`}
          accessibilityRole="button"
          accessibilityLabel={getRegionAccessibilityLabel(region.id)}
          className="absolute min-h-11 min-w-11 items-center justify-center rounded-full"
          hitSlop={10}
          onPress={() => onRegionPress?.(region.id)}
          style={{
            left: `${region.x * 100}%`,
            top: `${region.y * 100}%`,
            transform: [{ translateX: -22 }, { translateY: -30 }],
          }}
        >
          <RegionMarker
            name={regionLabels[region.id]}
            total={`${regionPercents[region.id] ?? 0}%`}
            pointerEvents="none"
            className={
              selectedRegionId === region.id ? "opacity-100" : "opacity-90"
            }
            style={{
              transform: [{ translateX: 5 }, { translateY: 5 }],
            }}
          />
        </Pressable>
      ))}
    </View>
  );
};
