import { ApiError, request, requestJson } from "./client";

export type BookmarkVisitStatusDto = "VISITED" | "NONE";

export type BookmarkDto = {
  /**
   * 장소 식별자. 서버는 placeId 가 아니라 `id` 로 내려준다 (실기기에서 확인).
   * 실제 응답: { id, name, regionCode, imageUrl, visitStatus, bookmarkedAt }
   */
  id: string;
  name: string;
  imageUrl: string | null;
  bookmarkedAt?: string;
  visitStatus?: BookmarkVisitStatusDto;
  regionCode?: string | null;
  regionName?: string | null;
  /** @deprecated 서버가 내려주지 않는다. 기존 호출부 호환용으로만 남겨둔다. */
  placeId?: string;
  /** @deprecated 서버가 내려주지 않는다. 기존 호출부 호환용으로만 남겨둔다. */
  address?: string;
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
    accessToken?: string;
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
      accessToken: options.accessToken,
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

/**
 * 찜 추가·해제는 응답 본문을 쓰지 않는다.
 * 2xx 가 왔는데 본문이 `{result:...}` 형태가 아니어도(빈 본문 포함) 쓰기는
 * 이미 일어난 것이므로 성공으로 본다. 4xx/5xx 와 네트워크 오류는 그대로 던진다.
 */
const writeBookmark = async (
  path: string,
  method: "POST" | "DELETE",
  accessToken: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<void> => {
  try {
    await request<unknown>(path, { method, body, accessToken, signal });
  } catch (error) {
    const isUnexpectedBody =
      error instanceof SyntaxError ||
      (error instanceof ApiError && error.code === "INVALID_RESPONSE");

    if (!isUnexpectedBody) {
      throw error;
    }
  }
};

export const addBookmark = (
  placeId: string,
  accessToken: string,
  signal?: AbortSignal,
): Promise<void> =>
  writeBookmark("/api/me/bookmarks", "POST", accessToken, { placeId }, signal);

export const removeBookmark = (
  placeId: string,
  accessToken: string,
  signal?: AbortSignal,
): Promise<void> =>
  writeBookmark(
    `/api/me/bookmarks/${placeId}`,
    "DELETE",
    accessToken,
    undefined,
    signal,
  );
