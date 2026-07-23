import { useWindowDimensions } from "react-native";

const MAX_CONTENT_WIDTH = 430;
const COMPACT_BREAKPOINT = 390;
const COMPOSITION_GAP = 12;
const CERTIFICATION_GAP = 8;
const CERTIFICATION_COLUMNS = 5;

/** 지역 상세(RegionDetailPage)와 같은 규칙: 본문 최대 430, 390 미만이면 좁은 화면. */
export const usePlaceDetailLayout = () => {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const isCompact = contentWidth < COMPACT_BREAKPOINT;
  const horizontalPadding = isCompact ? 16 : 20;
  const innerWidth = contentWidth - horizontalPadding * 2;

  return {
    maxContentWidth: MAX_CONTENT_WIDTH,
    contentWidth,
    isCompact,
    horizontalPadding,
    heroHeight: isCompact ? 240 : 280,
    titleSize: isCompact ? 28 : 34,
    scoreValueSize: isCompact ? 22 : 26,
    missionThumbSize: isCompact ? 64 : 78,
    compositionCardWidth: Math.floor(
      (innerWidth - COMPOSITION_GAP) / 2,
    ),
    compositionImageHeight: isCompact ? 92 : 108,
    certificationThumbSize: Math.floor(
      (innerWidth - CERTIFICATION_GAP * (CERTIFICATION_COLUMNS - 1)) /
        CERTIFICATION_COLUMNS,
    ),
    certificationGap: CERTIFICATION_GAP,
    compositionGap: COMPOSITION_GAP,
  };
};
