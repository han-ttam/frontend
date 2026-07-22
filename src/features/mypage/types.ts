export type MypageProfile = {
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  level: number;
  exp: number;
  expForNextLevel: number;
  dogamPercent: number;
  visitedCount: number;
  nationalRank: number;
  totalUsers: number;
  bio?: string | null;
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
  topPercent: number;
  top3: RankingTraveler[];
  leaderboard: {
    items: RankingTraveler[];
    nextCursor: string | null;
  };
  me: {
    rank: number;
    score: number;
    dogamPercent: number;
    pointsToNext: number;
  };
};
