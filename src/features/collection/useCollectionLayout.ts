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

  // 사진첩 3열 그리드 — 내림하지 않으면 320px 에서 셀 합계가 컨테이너를 넘긴다.
  const photoGridGap = isCompact ? 8 : 10;
  const photoCellSize = Math.floor(
    (contentWidth - horizontalPadding * 2 - photoGridGap * 2) / 3,
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
    // 도감 도 상세 · 관광지 사진첩 · 대표 선택 시트
    placeCardWidth: regionCardWidth,
    placeImageHeight: isCompact ? 132 : 148,
    photoCellSize,
    photoGridGap,
    sheetPreviewHeight: isCompact ? 200 : 240,
    sheetThumbSize: isCompact ? 56 : 64,
    /** 제목 위에 현재 대표 사진을 보여주는 영역. */
    heroHeight: isCompact ? 176 : 208,
  };
};
