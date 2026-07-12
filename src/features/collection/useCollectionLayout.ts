import { useWindowDimensions } from "react-native";

const MAX_CONTENT_WIDTH = 430;
const COMPACT_BREAKPOINT = 390;
const GRID_GAP = 12;

export const useCollectionLayout = () => {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const isCompact = contentWidth < COMPACT_BREAKPOINT;
  const horizontalPadding = isCompact ? 16 : 20;
  const regionCardWidth = Math.floor(
    (contentWidth - horizontalPadding * 2 - GRID_GAP) / 2,
  );

  return {
    maxContentWidth: MAX_CONTENT_WIDTH,
    contentWidth,
    isCompact,
    horizontalPadding,
    gridGap: GRID_GAP,
    regionCardWidth,
    regionImageHeight: isCompact ? 92 : 104,
    overviewPercentSize: isCompact ? 30 : 34,
    stampMaxSize: isCompact ? 38 : 44,
    stampGap: isCompact ? 4 : 6,
    recentThumbSize: isCompact ? 56 : 64,
  };
};
