import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";

import { ApiError } from "@/lib/api/client";
import { toErrorMessage } from "../../errorMessage";
import type { Place, ScorePreview } from "../../types";
import { usePlaceAndScore } from "../usePlaceAndScore";

const place: Place = {
  id: "p1",
  name: "영금정",
  address: null,
  description: null,
  mission: null,
  tags: [],
  rarityWeight: 1,
};

const score: ScorePreview = {
  action: "CERT_PHOTO",
  basePoints: 15,
  regionWeight: 1.5,
  rarityWeight: 1,
  eventMultiplier: 1,
  estimatedPoints: 22.5,
};

const mockGetPlace = jest.fn();
const mockGetScorePreview = jest.fn();

jest.mock("../../api", () => ({
  getPlace: (...args: unknown[]) => mockGetPlace(...args),
  getScorePreview: (...args: unknown[]) => mockGetScorePreview(...args),
}));

/** staleTime 은 앱 기본값(_layout.tsx 의 5분)과 맞춘다 — 캐시 공유를 그대로 재현하려면 필요하다. */
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { gcTime: 0, retry: false, staleTime: 1000 * 60 * 5 },
    },
  });

  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return Wrapper;
};

describe("usePlaceAndScore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPlace.mockResolvedValue(place);
    mockGetScorePreview.mockResolvedValue(score);
  });

  it("placeId 로 장소와 점수를 함께 돌려준다", async () => {
    const { result } = await renderHook(() => usePlaceAndScore("p1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual({ place, score });
    expect(result.current.error).toBeNull();
  });

  it("같은 placeId 를 쓰는 두 화면은 네트워크를 한 번만 탄다", async () => {
    const wrapper = createWrapper();

    // 카메라 화면
    const first = await renderHook(() => usePlaceAndScore("p1"), { wrapper });
    await waitFor(() => {
      expect(first.result.current.data).toBeDefined();
    });

    // 검토 화면 — 같은 queryKey 라 캐시로 즉시 뜬다
    const second = await renderHook(() => usePlaceAndScore("p1"), { wrapper });

    expect(second.result.current.data).toEqual({ place, score });
    expect(second.result.current.isLoading).toBe(false);
    expect(mockGetPlace).toHaveBeenCalledTimes(1);
    expect(mockGetScorePreview).toHaveBeenCalledTimes(1);
  });

  it("placeId 가 다르면 각각 따로 조회한다", async () => {
    const wrapper = createWrapper();

    const first = await renderHook(() => usePlaceAndScore("p1"), { wrapper });
    await waitFor(() => {
      expect(first.result.current.data).toBeDefined();
    });

    const second = await renderHook(() => usePlaceAndScore("p2"), { wrapper });
    await waitFor(() => {
      expect(second.result.current.data).toBeDefined();
    });

    expect(mockGetPlace).toHaveBeenCalledWith("p1");
    expect(mockGetPlace).toHaveBeenCalledWith("p2");
    expect(mockGetPlace).toHaveBeenCalledTimes(2);
  });

  it("placeId 가 없으면 조회하지 않는다", async () => {
    const { result } = await renderHook(() => usePlaceAndScore(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(mockGetPlace).not.toHaveBeenCalled();
  });

  it("실패하면 ApiError 가 그대로 error 에 담기고, 한글 문구는 toErrorMessage 가 만든다", async () => {
    mockGetPlace.mockRejectedValue(new ApiError("Place not found", "NOT_FOUND", 404));

    const { result } = await renderHook(() => usePlaceAndScore("missing"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    // 식별 정보(code/status)는 보존되고 — 이게 404 를 특정할 수 있게 해준다
    expect(result.current.error).toMatchObject({ code: "NOT_FOUND", status: 404 });
    // 사용자에게 보여줄 문구는 표현 계층에서 만든다
    expect(toErrorMessage(result.current.error, "폴백")).toBe("요청한 데이터를 찾을 수 없습니다");
    expect(result.current.data).toBeUndefined();
  });
});
