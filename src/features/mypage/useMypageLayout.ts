import { useWindowDimensions } from "react-native";

const MAX_CONTENT_WIDTH = 430;
const COMPACT_BREAKPOINT = 390;

export const useMypageLayout = () => {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const isCompact = contentWidth < COMPACT_BREAKPOINT;

  return {
    maxContentWidth: MAX_CONTENT_WIDTH,
    contentWidth,
    isCompact,
    profileAvatarSize: isCompact ? 60 : 72,
    statValueSize: isCompact ? 24 : 28,
    statLabelSize: isCompact ? 12 : 13,
    coverWidth: isCompact ? 64 : 78,
    coverHeight: isCompact ? 86 : 100,
    stampMaxSize: isCompact ? 38 : 44,
    stampGap: isCompact ? 4 : 6,
    ringSize: isCompact ? 82 : 96,
    topPercentTitleSize: isCompact ? 22 : 26,
    podiumAvatarSize: isCompact ? 52 : 60,
    podiumLeaderAvatarSize: isCompact ? 62 : 72,
    rowAvatarSize: isCompact ? 24 : 28,
    rankColumnWidth: isCompact ? 32 : 40,
    scoreColumnWidth: isCompact ? 54 : 64,
    tableTextSize: isCompact ? 12 : 13,
    tableHeaderSize: isCompact ? 11 : 12,
  };
};
