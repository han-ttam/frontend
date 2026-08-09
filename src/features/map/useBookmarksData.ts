import { fetchBookmarks, type BookmarkListDto } from "@/lib/api/bookmarks";
import { useQuery } from "@tanstack/react-query";

export const useBookmarksData = () => {
  const query = useQuery<BookmarkListDto, Error>({
    queryFn: ({ signal }) => fetchBookmarks({ limit: 50 }, signal),
    queryKey: ["bookmarks"],
    retry: false,
  });

  return {
    data: query.data?.items ?? [],
    nextCursor: query.data?.nextCursor ?? null,
    error: query.error ?? undefined,
    isLoading: query.isLoading,
    reload: query.refetch,
  };
};
