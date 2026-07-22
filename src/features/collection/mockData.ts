import type {
  DogamOverview,
  DogamRecent,
  DogamRegion,
  DogamThemes,
} from "@/features/collection/types";

const photo = (id: string, width = 400) => {
  return `https://images.unsplash.com/${id}?q=80&w=${width}&auto=format&fit=crop`;
};

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return date.toISOString();
};

export const dogamOverview: DogamOverview = {
  percent: 63,
  collected: 102,
  total: 161,
};

export const dogamRegions: DogamRegion[] = [
  {
    provinceCode: "1",
    name: "서울 · 경기",
    percent: 80,
    collected: 32,
    total: 40,
    locked: false,
    imageUrl: photo("photo-1538485399081-7191377e8241"),
  },
  {
    provinceCode: "32",
    name: "강원도",
    percent: 74,
    collected: 15,
    total: 21,
    locked: false,
    imageUrl: photo("photo-1500534314209-a25ddb2bd429"),
  },
  {
    provinceCode: "33",
    name: "충청도",
    percent: 55,
    collected: 11,
    total: 20,
    locked: false,
    imageUrl: photo("photo-1535189043414-47a3c49a0bed"),
  },
  {
    provinceCode: "35",
    name: "경상도",
    percent: 60,
    collected: 18,
    total: 30,
    locked: false,
    imageUrl: photo("photo-1548115184-bc6544d06a58"),
  },
  {
    provinceCode: "37",
    name: "전라도",
    percent: 65,
    collected: 13,
    total: 20,
    locked: false,
    imageUrl: photo("photo-1501854140801-50d01698950b"),
  },
  {
    provinceCode: "39",
    name: "제주도",
    percent: 90,
    collected: 13,
    total: 14,
    locked: false,
    imageUrl: photo("photo-1506929562872-bb421503ef21"),
  },
  {
    provinceCode: "90",
    name: "울릉도 · 독도",
    percent: 30,
    collected: 3,
    total: 10,
    locked: false,
    imageUrl: photo("photo-1519046904884-53103b34b206"),
  },
  {
    provinceCode: "11",
    name: "세종특별자치시",
    percent: 0,
    collected: 0,
    total: 12,
    locked: true,
    imageUrl: photo("photo-1441974231531-c6227db76b6e"),
  },
];

export const dogamThemes: DogamThemes = {
  items: [
    {
      collectionId: "hangang-picnic",
      title: "한강 피크닉 명소 모음",
      filled: 10,
      total: 10,
      thumbnails: [
        photo("photo-1526401485004-46910ecc8e51", 120),
        photo("photo-1485965120184-e220f721d03e", 120),
        photo("photo-1441974231531-c6227db76b6e", 120),
        photo("photo-1497515114629-f71d768fd07c", 120),
        photo("photo-1530041539828-114de669390e", 120),
      ],
    },
    {
      collectionId: "seoul-nightview",
      title: "서울 야경 필수 코스",
      filled: 9,
      total: 10,
      thumbnails: [
        photo("photo-1517154421773-0529f29ea451", 120),
        photo("photo-1519501025264-65ba15a82390", 120),
        photo("photo-1480714378408-67cf0d13bc1b", 120),
        photo("photo-1514924013411-cbf25faa35bb", 120),
        photo("photo-1493246507139-91e8fad9978e", 120),
      ],
    },
    {
      collectionId: "seoul-cafe-tour",
      title: "서울 감성 카페 투어",
      filled: 7,
      total: 10,
      thumbnails: [
        photo("photo-1509042239860-f550ce710b93", 120),
        photo("photo-1551024506-0bccd828d307", 120),
        photo("photo-1544787219-7f47ccb76574", 120),
        photo("photo-1493857671505-72967e2e2760", 120),
      ],
    },
    {
      collectionId: "jeju-coast-drive",
      title: "제주 해안 드라이브",
      filled: 5,
      total: 10,
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

export const dogamRecent: DogamRecent = {
  items: [
    {
      placeId: "namsan-tower",
      name: "남산서울타워",
      imageUrl: photo("photo-1538485399081-7191377e8241", 300),
      collectedAt: daysAgo(0),
    },
    {
      placeId: "seongsan-ilchulbong",
      name: "성산일출봉",
      imageUrl: photo("photo-1506929562872-bb421503ef21", 300),
      collectedAt: daysAgo(1),
    },
    {
      placeId: "gyeongbokgung",
      name: "경복궁",
      imageUrl: photo("photo-1535189043414-47a3c49a0bed", 300),
      collectedAt: daysAgo(3),
    },
    {
      placeId: "seoraksan",
      name: "설악산 국립공원",
      imageUrl: photo("photo-1500534314209-a25ddb2bd429", 300),
      collectedAt: daysAgo(6),
    },
    {
      placeId: "haeundae",
      name: "해운대 해수욕장",
      imageUrl: null,
      collectedAt: daysAgo(12),
    },
  ],
  nextCursor: null,
};
