export type MypageProfile = {
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  level: number;
  exp: number;
  expForNextLevel: number;
  dogamPercent: number;
  visitedCount: number;
  /** 아직 랭킹에 들지 못한 사용자는 null 이다. 신규 계정의 정상 상태다. */
  nationalRank: number | null;
  totalUsers: number;
  /** 서버가 내려주지 않는다. 화면에서 쓰지 않는다. */
  bio?: string | null;
  /** 서버가 내려주지 않는다. 화면에서 쓰지 않는다. */
  location?: string | null;
};

export type MypageCollectionItem = {
  id: string;
  title: string;
  filled: number;
  total: number;
  coverImageUrl?: string | null;
  thumbnails: string[];
};

export type MypageCollections = {
  overall: {
    collected: number;
    total: number;
  };
  items: MypageCollectionItem[];
  nextCursor: string | null;
};

/** 모음 종류 — 시안의 `테마 모음` 배지 값 */
export type CollectionType = "THEME" | "REGION" | "EVENT";

/** 모음 안의 명소 한 곳. 필드명은 /api/regions/{code}/places 응답과 동일하다. */
export type CollectionPlace = {
  placeId: string;
  name: string;
  /** 서버가 주소를 비워 보내는 장소가 실제로 있다(예: 익선동 한옥거리). */
  address: string | null;
  imageUrl: string | null;
  visitStatus: "VISITED" | "NONE";
};

/** 모음 상세 한 건 (GET /api/collections/{id} 예상 응답) */
export type CollectionDetail = {
  id: string;
  title: string;
  description: string | null;
  type: CollectionType;
  coverImageUrl: string | null;
  progress: {
    collected: number;
    total: number;
  };
  items: CollectionPlace[];
  nextCursor: string | null;
};

export type RankingPeriod = "CUMULATIVE" | "MONTHLY";

export type RankingTraveler = {
  rank: number;
  handle: string;
  score: number;
  dogamPercent: number;
  avatarUrl: string | null;
  badge?: string | null;
};

export type MypageRanking = {
  /** 랭킹 데이터가 없으면 null 이다. */
  topPercent: number | null;
  top3: RankingTraveler[];
  leaderboard: {
    items: RankingTraveler[];
    nextCursor: string | null;
  };
  me: {
    /** 아직 순위가 없으면 null 이다. */
    rank: number | null;
    score: number;
    dogamPercent: number;
    pointsToNext: number;
  };
};
