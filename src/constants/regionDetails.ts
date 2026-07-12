import type { RegionId } from "@/constants/regions";

export type RegionSpotStatus = "completed" | "planned";

export type RegionSpot = {
  id: string;
  title: string;
  address: string;
  imageUrl: string | null;
  status: RegionSpotStatus;
};

export type RegionDetail = {
  id: RegionId;
  title: string;
  subtitle: string;
  totalCount: number;
  completedCount: number;
  accentRegionIds: RegionId[];
  recommendation: RegionSpot;
  spots: RegionSpot[];
};

const gangwonSpots: RegionSpot[] = [
  {
    id: "seoraksan",
    title: "설악산 국립공원",
    address: "속초시 설악산로 833",
    imageUrl:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=600&auto=format&fit=crop",
    status: "completed",
  },
  {
    id: "auraji",
    title: "정선 아우라지",
    address: "정선군 여량면 아우라지길 60",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600&auto=format&fit=crop",
    status: "completed",
  },
  {
    id: "naksansa",
    title: "낙산사",
    address: "양양군 강현면 낙산사로 100",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
    status: "completed",
  },
  {
    id: "railbike",
    title: "강릉 정동진 레일바이크",
    address: "강릉시 강동면 정동역길 17",
    imageUrl:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=600&auto=format&fit=crop",
    status: "completed",
  },
  {
    id: "sokcho-beach",
    title: "속초해수욕장",
    address: "속초시 조양동",
    imageUrl:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=600&auto=format&fit=crop",
    status: "planned",
  },
  {
    id: "hajodae",
    title: "하조대 해변",
    address: "양양군 현북면 하조대해안길 122",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
    status: "planned",
  },
];

export const regionDetails: Record<RegionId, RegionDetail> = {
  seoul: {
    id: "seoul",
    title: "서울·경기",
    subtitle: "도시의 리듬과 오래된 이야기가 만나는 여행지",
    totalCount: 18,
    completedCount: 12,
    accentRegionIds: ["seoul"],
    recommendation: {
      id: "bukchon",
      title: "북촌 한옥마을",
      address: "서울 종로구 계동길 37",
      imageUrl:
        "https://images.unsplash.com/photo-1538485399081-7c8ed7f22b0f?q=80&w=900&auto=format&fit=crop",
      status: "planned",
    },
    spots: gangwonSpots.slice(0, 6),
  },
  gangwon: {
    id: "gangwon",
    title: "강원특별자치도",
    subtitle: "푸른 산과 바다, 자연이 빚은 힐링 여행지",
    totalCount: 21,
    completedCount: 15,
    accentRegionIds: ["gangwon"],
    recommendation: {
      id: "yeonggeumjeong",
      title: "속초 영금정",
      address: "속초시 영금정로 43",
      imageUrl:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=900&auto=format&fit=crop",
      status: "planned",
    },
    spots: gangwonSpots,
  },
  chungbuk: {
    id: "chungbuk",
    title: "충청북도",
    subtitle: "호수와 산길이 차분하게 이어지는 내륙 여행지",
    totalCount: 16,
    completedCount: 9,
    accentRegionIds: ["chungbuk"],
    recommendation: gangwonSpots[1],
    spots: gangwonSpots,
  },
  chungnam: {
    id: "chungnam",
    title: "충청남도",
    subtitle: "서해 노을과 백제 문화가 함께 흐르는 여행지",
    totalCount: 17,
    completedCount: 10,
    accentRegionIds: ["chungnam"],
    recommendation: gangwonSpots[4],
    spots: gangwonSpots,
  },
  gyeongbuk: {
    id: "gyeongbuk",
    title: "경상북도",
    subtitle: "깊은 역사와 산사의 고요함을 품은 여행지",
    totalCount: 20,
    completedCount: 12,
    accentRegionIds: ["gyeongbuk"],
    recommendation: gangwonSpots[0],
    spots: gangwonSpots,
  },
  gyeongnam: {
    id: "gyeongnam",
    title: "경상남도",
    subtitle: "남해 바다와 섬, 오래 머물고 싶은 여행지",
    totalCount: 19,
    completedCount: 11,
    accentRegionIds: ["gyeongnam"],
    recommendation: gangwonSpots[2],
    spots: gangwonSpots,
  },
  jeonbuk: {
    id: "jeonbuk",
    title: "전라북도",
    subtitle: "맛과 한옥, 느린 골목이 어울리는 여행지",
    totalCount: 15,
    completedCount: 9,
    accentRegionIds: ["jeonbuk"],
    recommendation: gangwonSpots[1],
    spots: gangwonSpots,
  },
  jeonnam: {
    id: "jeonnam",
    title: "전라남도",
    subtitle: "섬과 바다, 남도의 정취가 깊은 여행지",
    totalCount: 18,
    completedCount: 10,
    accentRegionIds: ["jeonnam"],
    recommendation: gangwonSpots[5],
    spots: gangwonSpots,
  },
  jeju: {
    id: "jeju",
    title: "제주도",
    subtitle: "화산섬의 바람과 푸른 바다가 빛나는 여행지",
    totalCount: 17,
    completedCount: 14,
    accentRegionIds: ["jeju"],
    recommendation: gangwonSpots[4],
    spots: gangwonSpots,
  },
};
