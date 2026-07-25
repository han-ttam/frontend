import { requestJson } from "./client";

export type BookmarkVisitStatusDto = "VISITED" | "NONE";

export type BookmarkDto = {
  placeId: string;
  name: string;
  address: string;
  imageUrl: string | null;
  visitStatus?: BookmarkVisitStatusDto;
  regionCode?: string | null;
  regionName?: string | null;
};

type BookmarkListResultDto =
  | BookmarkDto[]
  | {
      items?: BookmarkDto[];
      nextCursor?: string | null;
    };

export type BookmarkListDto = {
  items: BookmarkDto[];
  nextCursor: string | null;
};

export const fetchBookmarks = async (
  options: {
    cursor?: string;
    limit?: number;
  } = {},
  signal?: AbortSignal,
): Promise<BookmarkListDto> => {
  const searchParams = new URLSearchParams();

  if (options.limit != null) {
    searchParams.set("limit", String(options.limit));
  }

  if (options.cursor) {
    searchParams.set("cursor", options.cursor);
  }

  const query = searchParams.toString();
  const result = await requestJson<BookmarkListResultDto>(
    `/api/me/bookmarks${query ? `?${query}` : ""}`,
    signal,
    {
    credentials: "include",
    },
  );

  if (Array.isArray(result)) {
    return {
      items: result,
      nextCursor: null,
    };
  }

  return {
    items: result.items ?? [],
    nextCursor: result.nextCursor ?? null,
  };
};
