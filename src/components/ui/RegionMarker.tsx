import { colors } from "@/constants/colors";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { View, ViewProps } from "react-native";
import { AppText } from "../AppText";

type RegionMarkerProps = ViewProps & {
  name: string;
  total: number;
};

const RegionMarker = ({ name, total, ...props }: RegionMarkerProps) => {
  return (
    <View {...props} className="items-center">
      <FontAwesome5 name="map-marker-alt" size={20} color={colors.primary} />
      <AppText variant="caption">{name}</AppText>
      <AppText variant="caption">{total}</AppText>
    </View>
  );
};

export default RegionMarker;
