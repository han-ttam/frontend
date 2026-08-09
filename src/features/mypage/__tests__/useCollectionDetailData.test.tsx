import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";

import { useCollectionDetailData } from "../useCollectionDetailData";

const mockFetchCollectionDetail = jest.fn();

jest.mock("@/lib/api/collectionDetail", () => ({
  fetchCollectionDetail: (...args: unknown[]) =>
    mockFetchCollectionDetail(...args),
}));

const detail = {
  id: "019f3840-0000-7000-8000-000000000001",
  title: "한강 피크닉 명소 모음",
  description: "한강을 따라 걷는 피크닉 스팟 10곳",
  type: "THEME" as const,
  coverImageUrl: null,
  progress: { collected: 7, total: 10 },
  items: [],
  nextCursor: null,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { gcTime: 0, retry: false, staleTime: 0 } },
  });

  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return Wrapper;
};

describe("useCollectionDetailData", () => {
  beforeEach(() => {
    mockFetchCollectionDetail.mockReset().mockResolvedValue(detail);
  });

  it("모음 상세를 서버에서 가져온다", async () => {
    const { result } = await renderHook(
      () => useCollectionDetailData(detail.id),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.title).toBe("한강 피크닉 명소 모음");
    expect(mockFetchCollectionDetail).toHaveBeenCalledWith(
      detail.id,
      expect.anything(),
    );
    expect(result.current.error).toBeNull();
  });

  it("없는 모음이면 에러를 돌려준다", async () => {
    mockFetchCollectionDetail.mockRejectedValue(
      new Error("Collection not found"),
    );

    const { result } = await renderHook(
      () => useCollectionDetailData("no-such-collection"),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.data).toBeUndefined();
  });

  it("id 가 없으면 조회하지 않는다", async () => {
    const { result } = await renderHook(
      () => useCollectionDetailData(undefined),
      { wrapper: createWrapper() },
    );

    expect(result.current.isLoading).toBe(false);
    expect(mockFetchCollectionDetail).not.toHaveBeenCalled();
  });
});
