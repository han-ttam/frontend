import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";

import { useCollectionDetailData } from "../useCollectionDetailData";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 0,
        retry: false,
        staleTime: 0,
      },
    },
  });

  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return Wrapper;
};

describe("useCollectionDetailData", () => {
  it("있는 모음이면 명소 목록을 돌려준다", async () => {
    const { result } = await renderHook(
      () => useCollectionDetailData("hangang-picnic"),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.title).toBe("한강 피크닉 명소 모음");
    expect(result.current.data?.items).toHaveLength(10);
    expect(result.current.error).toBeNull();
  });

  it("없는 모음이면 에러를 돌려준다", async () => {
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
    expect(result.current.data).toBeUndefined();
  });
});
