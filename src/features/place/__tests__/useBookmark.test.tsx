import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";

import { useBookmark } from "../useBookmark";

const mockFetchBookmarks = jest.fn();
const mockAddBookmark = jest.fn();
const mockRemoveBookmark = jest.fn();

let mockAuth: { isAuthenticated: boolean; accessToken?: string } = {
  isAuthenticated: true,
  accessToken: "access-1",
};

jest.mock("@/lib/api/bookmarks", () => ({
  fetchBookmarks: (...args: unknown[]) => mockFetchBookmarks(...args),
  addBookmark: (...args: unknown[]) => mockAddBookmark(...args),
  removeBookmark: (...args: unknown[]) => mockRemoveBookmark(...args),
}));

jest.mock("@/stores/authStore", () => ({
  useAuth: () => mockAuth,
}));

// 서버는 장소 식별자를 placeId 가 아니라 id 로 내려준다 (실기기에서 확인).
// 실제 응답: { id, name, regionCode, imageUrl, visitStatus, bookmarkedAt }
const page = (placeIds: string[], nextCursor: string | null = null) => ({
  items: placeIds.map((id) => ({
    id,
    name: `장소 ${id}`,
    regionCode: "1_23",
    imageUrl: null,
    visitStatus: "PLANNED" as const,
    bookmarkedAt: "2026-08-08T14:49:01.074Z",
  })),
  nextCursor,
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { gcTime: 0, retry: false, staleTime: 0 },
      // mutation 의 gcTime 기본값은 5분이다. 그대로 두면 테스트가 끝나도
      // 타이머가 남아 jest 프로세스가 5분 동안 종료되지 않는다.
      mutations: { gcTime: 0, retry: false },
    },
  });

  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return Wrapper;
};

describe("useBookmark", () => {
  beforeEach(() => {
    mockAuth = { isAuthenticated: true, accessToken: "access-1" };
    mockFetchBookmarks.mockReset().mockResolvedValue(page([]));
    mockAddBookmark.mockReset().mockResolvedValue(undefined);
    mockRemoveBookmark.mockReset().mockResolvedValue(undefined);
  });

  it("게스트면 찜 목록을 조회하지 않고 버튼도 내주지 않는다", async () => {
    mockAuth = { isAuthenticated: false };

    const { result } = await renderHook(() => useBookmark("place-1"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isAvailable).toBe(false);
    expect(mockFetchBookmarks).not.toHaveBeenCalled();
  });

  it("목록에 있으면 찜한 상태다", async () => {
    mockFetchBookmarks.mockResolvedValue(page(["place-1", "place-2"]));

    const { result } = await renderHook(() => useBookmark("place-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isBookmarked).toBe(true);
    });
    expect(result.current.isAvailable).toBe(true);
  });

  it("커서가 이어지면 다음 페이지까지 모은다", async () => {
    mockFetchBookmarks
      .mockResolvedValueOnce(page(["place-9"], "cursor-2"))
      .mockResolvedValueOnce(page(["place-1"]));

    const { result } = await renderHook(() => useBookmark("place-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isBookmarked).toBe(true);
    });
    expect(mockFetchBookmarks).toHaveBeenCalledTimes(2);
    expect(mockFetchBookmarks.mock.calls[1][0]).toEqual(
      expect.objectContaining({ cursor: "cursor-2" }),
    );
  });

  it("조회가 끝나기 전에는 버튼이 잠긴다", async () => {
    let resolvePage: ((value: unknown) => void) | undefined;
    // Once 로 둬야 이후 재조회가 대기 상태로 남지 않는다.
    mockFetchBookmarks.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePage = resolve;
        }),
    );

    const { result } = await renderHook(() => useBookmark("place-1"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isDisabled).toBe(true);

    await act(async () => {
      resolvePage?.(page([]));
    });

    await waitFor(() => {
      expect(result.current.isDisabled).toBe(false);
    });
  });

  it("서버 응답을 기다리지 않고 하트가 먼저 켜진다", async () => {
    let finishAdd: (() => void) | undefined;
    mockAddBookmark.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishAdd = () => resolve();
        }),
    );

    const { result } = await renderHook(() => useBookmark("place-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isDisabled).toBe(false);
    });

    await act(async () => {
      result.current.toggle();
    });

    // finishAdd 를 아직 부르지 않았으므로 서버 응답은 오지 않은 상태다.
    // 그런데도 하트는 이미 켜져 있어야 한다.
    await waitFor(() => {
      expect(result.current.isBookmarked).toBe(true);
    });
    expect(mockAddBookmark).toHaveBeenCalledWith("place-1", "access-1");

    await act(async () => {
      finishAdd?.();
    });
  });

  it("찜을 추가하면 다시 조회해도 찜한 상태로 남는다", async () => {
    mockFetchBookmarks
      .mockResolvedValueOnce(page([]))
      .mockResolvedValue(page(["place-1"]));

    const { result } = await renderHook(() => useBookmark("place-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isDisabled).toBe(false);
    });

    await act(async () => {
      result.current.toggle();
    });

    await waitFor(() => {
      expect(result.current.isBookmarked).toBe(true);
    });
    expect(mockAddBookmark).toHaveBeenCalledWith("place-1", "access-1");
    expect(mockRemoveBookmark).not.toHaveBeenCalled();
  });

  it("찜한 장소를 토글하면 해제를 부른다", async () => {
    mockFetchBookmarks.mockResolvedValue(page(["place-1"]));

    const { result } = await renderHook(() => useBookmark("place-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isBookmarked).toBe(true);
    });

    await act(async () => {
      result.current.toggle();
    });

    expect(mockRemoveBookmark).toHaveBeenCalledWith("place-1", "access-1");
  });

  it("토글이 실패하면 원래 상태로 돌아오고 toggleError 가 채워진다", async () => {
    mockAddBookmark.mockRejectedValue(new Error("HTTP 500"));

    const { result } = await renderHook(() => useBookmark("place-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isDisabled).toBe(false);
    });

    await act(async () => {
      result.current.toggle();
    });

    await waitFor(() => {
      expect(result.current.toggleError).toBeTruthy();
    });
    expect(result.current.isBookmarked).toBe(false);
  });
});
