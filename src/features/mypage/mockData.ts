import type {
  MypageCollections,
  MypageProfile,
  MypageRanking,
  RankingPeriod,
} from "@/features/mypage/types";

const photo = (id: string, width = 200) => {
  return `https://images.unsplash.com/${id}?q=80&w=${width}&auto=format&fit=crop`;
};

export const mypageProfile: MypageProfile = {
  handle: "travel_collector",
  displayName: "여행수집가",
  avatarUrl: photo("photo-1543466835-00a7907e9de1"),
  level: 23,
  exp: 2450,
  expForNextLevel: 3200,
  dogamPercent: 63,
  visitedCount: 102,
  nationalRank: 127,
  totalUsers: 15284,
  bio: "여행을 수집하고 기록하는 중!",
  location: "서울특별시",
};

export const mypageCollections: MypageCollections = {
  overall: {
    collected: 102,
    total: 161,
  },
  items: [
    {
      id: "hangang-picnic",
      title: "한강 피크닉 명소 모음",
      filled: 10,
      total: 10,
      coverImageUrl: photo("photo-1502920917128-1aa500764cbd", 400),
      thumbnails: [
        photo("photo-1526401485004-46910ecc8e51", 120),
        photo("photo-1485965120184-e220f721d03e", 120),
        photo("photo-1441974231531-c6227db76b6e", 120),
        photo("photo-1497515114629-f71d768fd07c", 120),
        photo("photo-1530041539828-114de669390e", 120),
      ],
    },
    {
      id: "seoul-nightview",
      title: "서울 야경 필수 코스",
      filled: 9,
      total: 10,
      coverImageUrl: photo("photo-1538485399081-7191377e8241", 400),
      thumbnails: [
        photo("photo-1517154421773-0529f29ea451", 120),
        photo("photo-1519501025264-65ba15a82390", 120),
        photo("photo-1480714378408-67cf0d13bc1b", 120),
        photo("photo-1514924013411-cbf25faa35bb", 120),
        photo("photo-1493246507139-91e8fad9978e", 120),
      ],
    },
    {
      id: "seoul-cafe-tour",
      title: "서울 감성 카페 투어",
      filled: 7,
      total: 10,
      coverImageUrl: photo("photo-1554118811-1e0d58224f24", 400),
      thumbnails: [
        photo("photo-1509042239860-f550ce710b93", 120),
        photo("photo-1551024506-0bccd828d307", 120),
        photo("photo-1544787219-7f47ccb76574", 120),
        photo("photo-1493857671505-72967e2e2760", 120),
      ],
    },
    {
      id: "jeju-coast-drive",
      title: "제주 해안 드라이브",
      filled: 5,
      total: 10,
      coverImageUrl: photo("photo-1506929562872-bb421503ef21", 400),
      thumbnails: [
        photo("photo-1507525428034-b723cf961d3e", 120),
        photo("photo-1519046904884-53103b34b206", 120),
        photo("photo-1523528283115-9bf9b1699245", 120),
        photo("photo-1500530855697-b586d89ba3ee", 120),
      ],
    },
  ],
  nextCursor: null,
};

const cumulativeRanking: MypageRanking = {
  topPercent: 1,
  top3: [
    {
      rank: 2,
      handle: "지도따라",
      score: 1118,
      dogamPercent: 92,
      avatarUrl: photo("photo-1514888286974-6c03e2ca1dba"),
      badge: "SILVER",
    },
    {
      rank: 1,
      handle: "여행마스터",
      score: 1245,
      dogamPercent: 96,
      avatarUrl: photo("photo-1552053831-71594a27632d"),
      badge: "GOLD",
    },
    {
      rank: 3,
      handle: "여행소년",
      score: 1072,
      dogamPercent: 88,
      avatarUrl: photo("photo-1585110396000-c9ffd4e4b308"),
      badge: "BRONZE",
    },
  ],
  leaderboard: {
    items: [
      {
        rank: 124,
        handle: "바다좋아",
        score: 333,
        dogamPercent: 66,
        avatarUrl: photo("photo-1441057206919-63d19fac2369", 120),
      },
      {
        rank: 125,
        handle: "산타는곰",
        score: 331,
        dogamPercent: 64,
        avatarUrl: photo("photo-1530595467537-0b5996c41f2d", 120),
      },
      {
        rank: 126,
        handle: "구름위산책",
        score: 316,
        dogamPercent: 63,
        avatarUrl: photo("photo-1526336024174-e58f5cdd8e13", 120),
      },
    ],
    nextCursor: null,
  },
  me: {
    rank: 127,
    score: 315,
    dogamPercent: 63,
    pointsToNext: 18,
  },
};

const monthlyRanking: MypageRanking = {
  topPercent: 4,
  top3: [
    {
      rank: 2,
      handle: "달빛산책",
      score: 214,
      dogamPercent: 71,
      avatarUrl: photo("photo-1514888286974-6c03e2ca1dba"),
      badge: "SILVER",
    },
    {
      rank: 1,
      handle: "한달수집가",
      score: 268,
      dogamPercent: 78,
      avatarUrl: photo("photo-1552053831-71594a27632d"),
      badge: "GOLD",
    },
    {
      rank: 3,
      handle: "주말여행러",
      score: 197,
      dogamPercent: 69,
      avatarUrl: photo("photo-1585110396000-c9ffd4e4b308"),
      badge: "BRONZE",
    },
  ],
  leaderboard: {
    items: [
      {
        rank: 39,
        handle: "바다좋아",
        score: 92,
        dogamPercent: 66,
        avatarUrl: photo("photo-1441057206919-63d19fac2369", 120),
      },
      {
        rank: 40,
        handle: "산타는곰",
        score: 88,
        dogamPercent: 64,
        avatarUrl: photo("photo-1530595467537-0b5996c41f2d", 120),
      },
      {
        rank: 41,
        handle: "구름위산책",
        score: 84,
        dogamPercent: 63,
        avatarUrl: photo("photo-1526336024174-e58f5cdd8e13", 120),
      },
    ],
    nextCursor: null,
  },
  me: {
    rank: 42,
    score: 81,
    dogamPercent: 63,
    pointsToNext: 3,
  },
};

export const mypageRankings: Record<RankingPeriod, MypageRanking> = {
  CUMULATIVE: cumulativeRanking,
  MONTHLY: monthlyRanking,
};
