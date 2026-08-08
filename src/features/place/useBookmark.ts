import {
  addBookmark,
  fetchBookmarks,
  removeBookmark,
} from "@/lib/api/bookmarks";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/stores/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const PAGE_SIZE = 100;

/** 커서가 잘못 와도 무한히 돌지 않게 하는 안전장치. 제품상 상한이 아니다. */
const MAX_PAGES = 20;

/**
 * 지도 담당의 useBookmarksData 가 이미 ["bookmarks"] 를 쓴다.
 * 같은 키를 쓰면 서로 다른 페이로드로 같은 캐시를 덮어써서 양쪽이 깨진다.
 */
const BOOKMARKED_PLACE_IDS_KEY = ["bookmarks", "all"] as const;

/**
 * 서버가 장소 응답에 isBookmarked 를 안 내려주기 때문에,
 * 찜 목록 전체를 받아 placeId 로 대조한다.
 */
const fetchBookmarkedPlaceIds = async (
  accessToken: string,
  signal?: AbortSignal,
): Promise<string[]> => {
  const placeIds: string[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const result = await fetchBookmarks(
      { accessToken, cursor, limit: PAGE_SIZE },
      signal,
    );

    placeIds.push(...result.items.map((item) => item.id));

    if (!result.nextCursor) {
      break;
    }

    cursor = result.nextCursor;
  }

  return placeIds;
};

export const useBookmark = (placeId: string | undefined) => {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const isAvailable = isAuthenticated && Boolean(accessToken);
  const enabled = isAvailable && Boolean(placeId);

  const listQuery = useQuery({
    enabled,
    queryFn: ({ signal }) => fetchBookmarkedPlaceIds(accessToken!, signal),
    queryKey: BOOKMARKED_PLACE_IDS_KEY,
  });

  const isBookmarked = Boolean(placeId && listQuery.data?.includes(placeId));

  const mutation = useMutation({
    mutationFn: async () => {
      if (!placeId || !accessToken) {
        return;
      }

      if (isBookmarked) {
        await removeBookmark(placeId, accessToken);
        return;
      }

      await addBookmark(placeId, accessToken);
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(BOOKMARKED_PLACE_IDS_KEY, context.previous);
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: BOOKMARKED_PLACE_IDS_KEY });

      const previous = queryClient.getQueryData<string[]>(
        BOOKMARKED_PLACE_IDS_KEY,
      );

      queryClient.setQueryData<string[]>(
        BOOKMARKED_PLACE_IDS_KEY,
        (current = []) =>
          isBookmarked
            ? current.filter((id) => id !== placeId)
            : [...current, placeId!],
      );

      return { previous };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: BOOKMARKED_PLACE_IDS_KEY });
    },
  });

  return {
    isAvailable,
    isBookmarked,
    // 목록이 오기 전에 누르면 현재 상태를 모르는 채 요청이 나간다.
    isDisabled: !enabled || listQuery.isLoading || mutation.isPending,
    toggle: () => mutation.mutate(),
    toggleError: mutation.error ?? null,
    // 토큰이 만료되면 서버가 401 을 준다. 앱에 토큰 갱신이 붙어 있지 않아
    // 재로그인 외엔 복구가 안 되므로, "다시 시도"와 다르게 안내해야 한다.
    isSessionExpired:
      mutation.error instanceof ApiError && mutation.error.status === 401,
  };
};
