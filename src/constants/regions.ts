export const regions = [
  {
    id: "seoul",
    name: "서울",
    x: 0.3,
    y: 0.22,
  },
  {
    id: "gangwon",
    name: "강원",
    x: 0.57,
    y: 0.18,
  },
  {
    id: "chungbuk",
    name: "충북",
    x: 0.44,
    y: 0.4,
  },
  {
    id: "chungnam",
    name: "충남",
    x: 0.26,
    y: 0.42,
  },

  {
    id: "gyeongbuk",
    name: "경북",
    x: 0.65,
    y: 0.44,
  },

  {
    id: "gyeongnam",
    name: "경남",
    x: 0.54,
    y: 0.65,
  },
  {
    id: "jeonbuk",
    name: "전북",
    x: 0.32,
    y: 0.58,
  },

  {
    id: "jeonnam",
    name: "전남",
    x: 0.27,
    y: 0.72,
  },
  {
    id: "jeju",
    name: "제주",
    x: 0.21,
    y: 0.93,
  },
] as const;

export type RegionId = (typeof regions)[number]["id"];
export type RegionName = (typeof regions)[number]["name"];
export type Region = (typeof regions)[number];
