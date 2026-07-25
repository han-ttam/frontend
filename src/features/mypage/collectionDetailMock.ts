import type { CollectionDetail } from "@/features/mypage/types";

/**
 * 모음 상세 화면용 목데이터 (API 연동 시 삭제).
 *
 * - `placeId` 는 실제 서버 UUID 다. 행을 누르면 기존 장소 상세(`/api/places/{id}`)가 실제로 열린다.
 * - `visitStatus` 는 로그인 사용자별 값이라 서버에서 가져올 수 없어, 앞쪽부터 VISITED 로 채운 시연용 값이다.
 * - 원본: `specs/002-mypage-collection-places/mock-places.json`
 */
export const collectionDetailMock: Record<string, CollectionDetail> = {
  "hangang-picnic": {
    id: "hangang-picnic",
    title: "한강 피크닉 명소 모음",
    description: "한강을 따라 걷는 피크닉 스팟 10곳",
    type: "THEME",
    coverImageUrl: null,
    progress: {
      collected: 7,
      total: 10,
    },
    items: [
      {
        placeId: "019f383e-63c5-77ab-8766-9dcf9e8989a9",
        name: "여의도한강공원 멀티프라자",
        address: "서울특별시 영등포구 여의도동 84-4",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/84/3544384_image3_1.jpg",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383e-63c3-768b-a32f-de720e1cae9e",
        name: "여의도한강공원",
        address: "서울특별시 영등포구 여의동로 330 (여의도동)",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/89/3544389_image3_1.jpg",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383d-89af-7559-a79b-5c3652698faf",
        name: "망원한강공원",
        address: "서울특별시 마포구 마포나루길 467",
        imageUrl: null,
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383d-7886-71d9-b106-09928551431e",
        name: "뚝섬한강공원 벽천마당",
        address: "서울특별시 광진구 자양동",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/65/3539865_image3_1.jpg",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383d-7883-72db-8467-a002a2f56ffc",
        name: "뚝섬한강공원",
        address: "서울특별시 광진구 강변북로 2273 (자양동)",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/61/3534561_image3_1.jpg",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383d-4143-717e-810e-10e19b46d4cc",
        name: "난지한강공원",
        address: "서울특별시 마포구 한강난지로 162 (상암동)",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/63/3571763_image3_1.jpg",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383d-1959-7066-9ffa-975c0d5fd3fb",
        name: "광나루한강공원",
        address: "서울특별시 강동구 선사로 83-106 (암사동)",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/11/3393811_image3_1.JPG",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383f-441f-76ce-ab5e-b8b53d857662",
        name: "한강방어 백골부대 전적비",
        address: "서울특별시 영등포구 여의동로 지하343 (여의도동)",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/08/3399708_image3_1.JPG",
        visitStatus: "NONE",
      },
      {
        placeId: "019f383f-441b-7798-b228-79298ce92472",
        name: "한강",
        address: "서울특별시 성동구 강변북로 257",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/58/3564958_image3_1.jpg",
        visitStatus: "NONE",
      },
      {
        placeId: "019f383e-a9b9-727f-8f97-da93556b7404",
        name: "이랜드크루즈(한강유람선)",
        address: "서울특별시 영등포구 여의동로 280 (여의도동)",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/80/3567180_image3_1.jpg",
        visitStatus: "NONE",
      },
    ],
    nextCursor: null,
  },
  "seoul-nightview": {
    id: "seoul-nightview",
    title: "서울 야경 필수 코스",
    description: "해가 지면 더 예뻐지는 서울 10곳",
    type: "THEME",
    coverImageUrl: null,
    progress: {
      collected: 9,
      total: 10,
    },
    items: [
      {
        placeId: "019f383d-7ff6-727b-bc71-e63ed62f63d4",
        name: "롯데월드타워&롯데월드몰",
        address: "서울특별시 송파구 올림픽로 300 (신천동)",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/94/2938994_image3_1.bmp",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383e-f5aa-733c-83c8-e3b7734e05a8",
        name: "채석장 전망대",
        address: "서울특별시 종로구 낙산5길 51 (창신동)",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/03/3384903_image3_1.JPG",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383d-41c8-7637-8f50-cee72c8ef634",
        name: "남산케이블카",
        address: "서울특별시 중구 소파로 83",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/50/3590450_image3_1.jpg",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383d-41c4-754f-9b80-991e142b9651",
        name: "남산인권숲",
        address: "서울특별시 중구 퇴계로26가길 6 (예장동)",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/70/3455270_image3_1.jpg",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383d-41c1-7323-892b-ef54b5a1082e",
        name: "남산예장공원",
        address: "서울특별시 중구 주자동",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/98/3067298_image3_1.JPG",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383d-41bb-772c-bd22-c38245faa68f",
        name: "남산순환나들길",
        address: "서울특별시 중구 남산공원길 609 (예장동)",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/60/3458860_image3_1.jpg",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383d-41a4-713b-b85b-944cd6146158",
        name: "남산공원(서울)",
        address: "서울특별시 중구 삼일대로 231 (예장동)",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/56/3539656_image3_1.jpg",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383d-41a1-73e4-8cc8-a0c862d4efb6",
        name: "남산골한옥마을",
        address: "서울특별시 중구 퇴계로34길 28 (필동2가)",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/94/2932494_image3_1.bmp",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383d-419b-75f3-bb5d-139c690d5d30",
        name: "남산 팔각정",
        address: "서울특별시 중구 예장동 8-1",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/25/3539625_image3_1.jpg",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383e-19f4-74de-9bd7-2fea99c9f747",
        name: "서울로 7017",
        address: "서울특별시 중구 한강대로 405",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/09/3081409_image3_1.jpg",
        visitStatus: "NONE",
      },
    ],
    nextCursor: null,
  },
  "seoul-cafe-tour": {
    id: "seoul-cafe-tour",
    title: "서울 감성 카페 투어",
    description: "골목마다 숨은 카페 거리 10곳",
    type: "THEME",
    coverImageUrl: null,
    progress: {
      collected: 7,
      total: 10,
    },
    items: [
      {
        placeId: "019f383f-745c-70df-87b2-3050d68daac4",
        name: "2025 서울 카페&베이커리페어",
        address: "서울특별시 강남구 남부순환로 3104 (대치동)",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/64/3432064_image3_1.jpg",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383e-2f33-756e-a79e-d77bd3fec23c",
        name: "성수동 카페거리",
        address: "서울특별시 성동구 성수동2가",
        imageUrl: null,
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383e-0cfd-749e-9c70-67033b9005e2",
        name: "상수동 카페거리",
        address: "서울특별시 마포구 상수동",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/77/3590377_image3_1.jpg",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383f-051f-775e-9f4c-78cedd2b551b",
        name: "청담패션거리",
        address: "서울특별시 강남구 청담동",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/40/3397540_image3_1.JPG",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383e-fdba-75ac-8811-4580ce33b25f",
        name: "천호자전거거리",
        address: "서울특별시 강동구 천호동",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/76/3566876_image3_1.jpg",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383e-b94b-757b-85ca-f5403734b528",
        name: "자양동 양꼬치거리 (중국음식문화거리)",
        address: "서울특별시 광진구 자양동",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/63/2372563_image3_1.jpg",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383e-ae1b-706c-a4f4-1fb4119df960",
        name: "익선동 한옥거리",
        address: null,
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/22/2947522_image3_1.jpg",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383e-a9b2-715b-9d0e-abbc9e79ab12",
        name: "이대거리",
        address: "서울특별시 서대문구 대현동",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/29/3467629_image3_1.jpg",
        visitStatus: "NONE",
      },
      {
        placeId: "019f383e-a83f-7494-a4fa-fe92ea6a22e0",
        name: "응암동 감자국 거리",
        address: "서울특별시 은평구 응암로 172 (응암동)",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/38/3465038_image3_1.jpg",
        visitStatus: "NONE",
      },
      {
        placeId: "019f383e-a827-77ff-819b-5e7c43baf926",
        name: "음식문화특화거리(깔깔거리)",
        address: "서울특별시 구로구 디지털로32길 97-21",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/54/3392954_image3_1.JPG",
        visitStatus: "NONE",
      },
    ],
    nextCursor: null,
  },
  "jeju-coast-drive": {
    id: "jeju-coast-drive",
    title: "제주 해안 드라이브",
    description: "바다를 끼고 달리는 제주 해안 10곳",
    type: "THEME",
    coverImageUrl: null,
    progress: {
      collected: 5,
      total: 10,
    },
    items: [
      {
        placeId: "019f383f-576d-7098-b423-eb803d9184b2",
        name: "형제해안도로",
        address: "제주특별자치도 서귀포시 안덕면 사계리 3682",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/77/3552077_image3_1.jpg",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383e-e600-70ae-95d8-aaee4e90f38d",
        name: "종달리 해안도로",
        address: "제주특별자치도 제주시 구좌읍 종달리",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/71/3368571_image3_1.jpg",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383e-e5ee-732a-a5f6-e8c396b6b3be",
        name: "조천함덕해안도로",
        address: "제주특별자치도 제주시 조천읍 조함해안로 525",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/92/3553692_image3_1.jpg",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383e-d70c-7412-b3d4-c34705aa2a67",
        name: "제주 무지개해안도로",
        address: "제주특별자치도 제주시 도두일동 1734",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/16/3384416_image3_1.jpg",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383e-9ab7-746a-9f83-30f1e6c75d7a",
        name: "월정리해안도로",
        address: "제주특별자치도 제주시 구좌읍 월정리 652-4",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/02/3553602_image3_1.jpg",
        visitStatus: "VISITED",
      },
      {
        placeId: "019f383e-805a-762f-b13a-68de604a526a",
        name: "용담해안도로",
        address: "제주특별자치도 제주시 서해안로 687-8 (용담이동)",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/29/3556229_image3_1.jpg",
        visitStatus: "NONE",
      },
      {
        placeId: "019f383e-50c3-710c-b644-f246873c4cf1",
        name: "신창풍차해안도로",
        address: "제주특별자치도 제주시 한경면 한경해안로 485",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/24/3354424_image3_1.jpg",
        visitStatus: "NONE",
      },
      {
        placeId: "019f383e-2f22-7508-ac98-e9884d751d41",
        name: "성산세화해안도로",
        address: "제주특별자치도 제주시 구좌읍 종달리 112-1",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/31/3355631_image3_1.jpg",
        visitStatus: "NONE",
      },
      {
        placeId: "019f383e-0a2f-77b3-be1b-165e2fdce773",
        name: "삼양해안도로",
        address: "제주특별자치도 제주시 삼양삼동 2582-1",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/73/3553473_image3_1.jpg",
        visitStatus: "NONE",
      },
      {
        placeId: "019f383f-4c05-7541-abd4-a49cddd26c3c",
        name: "함덕해수욕장 (함덕 서우봉 해변)",
        address: "제주특별자치도 제주시 조천읍 조함해안로 519-10",
        imageUrl: "http://tong.visitkorea.or.kr/cms/resource/00/3354600_image3_1.jpg",
        visitStatus: "NONE",
      },
    ],
    nextCursor: null,
  },
};

/** 없는 모음이면 던진다 — 화면의 "모음을 찾을 수 없어요" 경로를 만든다. */
export const resolveCollectionDetailMock = async (id: string) => {
  const detail = collectionDetailMock[id];

  if (!detail) {
    throw new Error("Collection not found");
  }

  return detail;
};
