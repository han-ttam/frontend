import { type KoreaRegionId } from "@/components/Korea";
import { KoreaMap } from "@/components/KoreaMap";
import RegionMarker from "@/components/ui/RegionMarker";
import { colors } from "@/constants/colors";
import { regionLabels, regions, type RegionId } from "@/constants/regions";
import { Pressable, View, type ViewProps } from "react-native";

type InteractiveKoreaMapProps = ViewProps & {
  selectedRegionId?: RegionId;
  regionColors?: Partial<Record<KoreaRegionId, string>>;
  onRegionPress?: (regionId: RegionId | undefined) => void;
};

const regionProgress: Record<RegionId, number> = {
  seoul: 80,
  gangwon: 70,
  chungbuk: 55,
  chungnam: 55,
  gyeongbuk: 60,
  gyeongnam: 60,
  jeonbuk: 65,
  jeonnam: 65,
  jeju: 90,
};

const getRegionAccessibilityLabel = (regionId: RegionId) =>
  `${regionLabels[regionId]} 지역 선택`;

export const InteractiveKoreaMap = ({
  selectedRegionId,
  regionColors,
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
        onRegionPress={(regionId) =>
          onRegionPress?.(selectedRegionId === regionId ? undefined : regionId)
        }
      />

      {regions.map((region) => (
        <Pressable
          key={region.id}
          testID={`region-hit-zone-${region.id}`}
          accessibilityRole="button"
          accessibilityLabel={getRegionAccessibilityLabel(region.id)}
          className="absolute min-h-11 min-w-11 items-center justify-center rounded-full"
          hitSlop={10}
          onPress={() =>
            onRegionPress?.(
              selectedRegionId === region.id ? undefined : region.id,
            )
          }
          style={{
            left: `${region.x * 100}%`,
            top: `${region.y * 100}%`,
            transform: [{ translateX: -22 }, { translateY: -30 }],
          }}
        >
          <RegionMarker
            name={regionLabels[region.id]}
            total={`${regionProgress[region.id]}%`}
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
