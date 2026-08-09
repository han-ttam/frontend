import type {
  DogamPhoto,
  DogamPlace,
  DogamPlacePhotos,
  DogamRegionDetail,
} from "@/features/collection/types";
import { dogamRegions } from "@/features/collection/mockData";

/**
 * 도감 도 상세 · 관광지 사진첩용 목데이터.
 *
 * 실제 API(`/api/me/dogam/*`)가 나오면 이 파일을 지우고 `queryFn`만 교체한다.
 * 관광지 수는 `mockData.ts`의 `region.collected`와 일치시켰다 —
 * "전체 {n}" 칩과 "{collected}/{total}곳" 헤더가 어긋나지 않게 하기 위함이다.
 */

const photo = (id: string, width = 400) => {
  return `https://images.unsplash.com/${id}?q=80&w=${width}&auto=format&fit=crop`;
};

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return date.toISOString();
};

const PHOTO_POOL = [
  "photo-1538485399081-7191377e8241",
  "photo-1500534314209-a25ddb2bd429",
  "photo-1535189043414-47a3c49a0bed",
  "photo-1548115184-bc6544d06a58",
  "photo-1501854140801-50d01698950b",
  "photo-1506929562872-bb421503ef21",
  "photo-1519046904884-53103b34b206",
  "photo-1441974231531-c6227db76b6e",
  "photo-1526401485004-46910ecc8e51",
  "photo-1485965120184-e220f721d03e",
  "photo-1497515114629-f71d768fd07c",
  "photo-1530041539828-114de669390e",
  "photo-1517154421773-0529f29ea451",
  "photo-1519501025264-65ba15a82390",
  "photo-1480714378408-67cf0d13bc1b",
  "photo-1514924013411-cbf25faa35bb",
  "photo-1493246507139-91e8fad9978e",
  "photo-1509042239860-f550ce710b93",
  "photo-1507525428034-b723cf961d3e",
  "photo-1523528283115-9bf9b1699245",
];

/** [placeId, 이름, 주소, 사진 장수, 가장 최근 인증이 며칠 전인지] */
type PlaceSeed = readonly [string, string, string, number, number];

const REGION_PLACE_SEEDS: Record<string, readonly PlaceSeed[]> = {
  // 서울 · 경기 — 32곳 (region.collected = 32)
  "1": [
    ["gyeongbokgung", "경복궁", "서울 종로구 사직로 161", 4, 2],
    ["namsan-tower", "남산서울타워", "서울 용산구 남산공원길 105", 5, 0],
    ["bukchon-hanok", "북촌한옥마을", "서울 종로구 계동길 37", 3, 5],
    ["changdeokgung", "창덕궁", "서울 종로구 율곡로 99", 3, 9],
    ["deoksugung", "덕수궁", "서울 중구 세종대로 99", 2, 14],
    ["cheonggyecheon", "청계천", "서울 중구 창신동", 2, 18],
    ["gwangjang-market", "광장시장", "서울 종로구 창경궁로 88", 3, 21],
    ["ikseondong", "익선동 한옥거리", "서울 종로구 수표로28길", 2, 25],
    ["seoul-forest", "서울숲", "서울 성동구 뚝섬로 273", 3, 30],
    ["lotte-tower", "롯데월드타워", "서울 송파구 올림픽로 300", 4, 33],
    ["banpo-hangang", "반포한강공원", "서울 서초구 신반포로11길 40", 3, 38],
    ["yeouido-hangang", "여의도한강공원", "서울 영등포구 여의동로 330", 2, 42],
    ["hongdae-street", "홍대 걷고싶은거리", "서울 마포구 양화로", 2, 47],
    ["itaewon-antique", "이태원 앤틱가구거리", "서울 용산구 이태원로", 1, 52],
    ["insadong", "인사동 쌈지길", "서울 종로구 인사동길 44", 2, 56],
    ["naksan-park", "낙산공원", "서울 종로구 낙산길 41", 2, 61],
    ["haneul-park", "하늘공원", "서울 마포구 하늘공원로 95", 3, 65],
    ["national-museum", "국립중앙박물관", "서울 용산구 서빙고로 137", 2, 70],
    ["ddp", "DDP 동대문디자인플라자", "서울 중구 을지로 281", 2, 74],
    ["seongsu-cafe", "성수동 카페거리", "서울 성동구 연무장길", 3, 79],
    ["suwon-hwaseong", "수원화성", "경기 수원시 팔달구 정조로 910", 4, 84],
    ["everland", "에버랜드", "경기 용인시 처인구 포곡읍", 3, 88],
    ["korean-folk-village", "한국민속촌", "경기 용인시 기흥구 민속촌로 90", 2, 93],
    ["namhansanseong", "남한산성", "경기 광주시 남한산성면", 2, 97],
    ["garden-morning-calm", "아침고요수목원", "경기 가평군 상면 수목원로 432", 3, 102],
    ["petite-france", "쁘띠프랑스", "경기 가평군 청평면 호반로 1063", 2, 106],
    ["dumulmeori", "두물머리", "경기 양평군 양서면 양수리", 3, 111],
    ["gwangmyeong-cave", "광명동굴", "경기 광명시 가학로85번길 142", 2, 115],
    ["heyri-village", "파주 헤이리마을", "경기 파주시 탄현면 헤이리마을길", 2, 120],
    ["imjingak", "임진각 평화누리", "경기 파주시 문산읍 임진각로 148", 1, 124],
    ["aegibong", "김포 애기봉평화생태공원", "경기 김포시 월곶면", 1, 129],
    ["daebudo", "안산 대부도", "경기 안산시 단원구 대부황금로", 2, 133],
  ],

  // 강원도 — 15곳 · 사진 41장 (시안 2c 값과 정확히 일치)
  "32": [
    ["sokcho-yeonggeumjeong", "속초 영금정", "속초시 영금정로 43", 5, 4],
    ["seoraksan", "설악산 국립공원", "속초시 설악산로 833", 4, 7],
    ["naksansa", "낙산사", "양양군 강현면 낙산사로 100", 3, 12],
    ["jeongseon-auraji", "정선 아우라지", "정선군 여량면 여량6길 17", 3, 16],
    ["jeongdongjin", "강릉 정동진", "강릉시 강동면 헌화로 990", 4, 20],
    ["namiseom", "남이섬", "춘천시 남산면 남이섬길 1", 3, 24],
    ["gyeongpodae", "경포대", "강릉시 경포로 365", 3, 29],
    ["ojukheon", "오죽헌", "강릉시 율곡로3139번길 24", 2, 34],
    ["daegwallyeong-ranch", "대관령 양떼목장", "평창군 대관령면 꽃밭양지길 708-9", 3, 38],
    ["soyanggang-skywalk", "춘천 소양강스카이워크", "춘천시 영서로 2663", 2, 43],
    ["woljeongsa", "평창 월정사", "평창군 진부면 오대산로 374-8", 2, 48],
    ["juksuru", "삼척 죽서루", "삼척시 죽서루길 37", 2, 53],
    ["chuam-candlestick", "동해 추암촛대바위", "동해시 촛대바위길 28", 2, 58],
    ["hwacheon-sancheoneo", "화천 산천어축제장", "화천군 화천읍 산천어길 137", 2, 63],
    ["inje-birch-forest", "인제 자작나무숲", "인제군 인제읍 자작나무숲길 760", 1, 68],
  ],

  // 충청도 — 11곳
  "33": [
    ["gongsanseong", "공주 공산성", "충남 공주시 웅진로 280", 3, 6],
    ["busosanseong", "부여 부소산성", "충남 부여군 부여읍 부소로 31", 2, 11],
    ["daecheon-beach", "대천해수욕장", "충남 보령시 대해로 665", 4, 15],
    ["kkotji-beach", "안면도 꽃지해변", "충남 태안군 안면읍", 3, 19],
    ["haemi-fortress", "서산 해미읍성", "충남 서산시 해미면 남문2로 143", 2, 26],
    ["cheongnamdae", "청남대", "충북 청주시 상당구 문의면 청남대길 646", 2, 31],
    ["dodamsambong", "단양 도담삼봉", "충북 단양군 매포읍 삼봉로 644", 4, 36],
    ["mancheonha-skywalk", "단양 만천하스카이워크", "충북 단양군 적성면 옷바위길 10", 2, 41],
    ["beopjusa", "속리산 법주사", "충북 보은군 속리산면 법주사로 405", 3, 46],
    ["chungjuho", "충주호", "충북 충주시 종민동", 2, 51],
    ["cheongpung-cable", "제천 청풍호반케이블카", "충북 제천시 청풍면 문화재길 166", 2, 57],
  ],

  // 경상도 — 18곳
  "35": [
    ["haeundae", "해운대 해수욕장", "부산 해운대구 우동", 5, 3],
    ["gamcheon-village", "감천문화마을", "부산 사하구 감내2로 203", 3, 8],
    ["gwangalli", "광안리 해수욕장", "부산 수영구 광안해변로", 4, 13],
    ["taejongdae", "태종대", "부산 영도구 전망로 24", 2, 17],
    ["huinnyeoul", "부산 흰여울문화마을", "부산 영도구 영선동4가", 3, 22],
    ["bulguksa", "경주 불국사", "경북 경주시 불국로 385", 4, 27],
    ["seokguram", "경주 석굴암", "경북 경주시 진현동 999", 2, 32],
    ["donggung-wolji", "경주 동궁과 월지", "경북 경주시 원화로 102", 3, 37],
    ["cheomseongdae", "경주 첨성대", "경북 경주시 인왕동 839-1", 2, 40],
    ["hahoe-village", "안동 하회마을", "경북 안동시 풍천면 하회종가길", 3, 45],
    ["mungyeong-saejae", "문경새재", "경북 문경시 문경읍 새재로 932", 2, 50],
    ["juwangsan", "주왕산 국립공원", "경북 청송군 부동면", 2, 55],
    ["dongpirang", "통영 동피랑벽화마을", "경남 통영시 동호동", 3, 60],
    ["geoje-windy-hill", "거제 바람의언덕", "경남 거제시 남부면 갈곶리", 3, 66],
    ["darangyi-village", "남해 다랭이마을", "경남 남해군 남면 남면로", 2, 71],
    ["jinjuseong", "진주성", "경남 진주시 남강로 626", 2, 76],
    ["haeinsa", "합천 해인사", "경남 합천군 가야면 해인사길 122", 2, 81],
    ["upo-wetland", "창녕 우포늪", "경남 창녕군 유어면 우포늪길", 1, 86],
  ],

  // 전라도 — 13곳
  "37": [
    ["jeonju-hanok", "전주한옥마을", "전북 전주시 완산구 기린대로 99", 5, 5],
    ["gyeonggijeon", "전주 경기전", "전북 전주시 완산구 태조로 44", 2, 10],
    ["gunsan-museum", "군산 근대역사박물관", "전북 군산시 해망로 240", 2, 15],
    ["chaeseokgang", "부안 채석강", "전북 부안군 변산면 격포리", 3, 20],
    ["naejangsan", "내장산 국립공원", "전북 정읍시 내장호반로 328", 4, 25],
    ["hyangiram", "여수 향일암", "전남 여수시 돌산읍 향일암로 60", 3, 30],
    ["odongdo", "여수 오동도", "전남 여수시 수정동", 2, 35],
    ["suncheonman-garden", "순천만 국가정원", "전남 순천시 국가정원1호길 47", 4, 40],
    ["nagan-fortress", "순천 낙안읍성", "전남 순천시 낙안면 충민길 30", 2, 45],
    ["juknokwon", "담양 죽녹원", "전남 담양군 담양읍 죽녹원로 119", 3, 50],
    ["metasequoia-road", "담양 메타세쿼이아길", "전남 담양군 담양읍 학동리", 3, 55],
    ["boseong-tea", "보성 녹차밭", "전남 보성군 보성읍 녹차로 763", 3, 60],
    ["yudalsan", "목포 유달산", "전남 목포시 죽교동", 2, 65],
  ],

  // 제주도 — 13곳
  "39": [
    ["seongsan-ilchulbong", "성산일출봉", "제주 서귀포시 성산읍 일출로 284-12", 5, 1],
    ["udo", "우도", "제주 제주시 우도면", 4, 6],
    ["manjanggul", "만장굴", "제주 제주시 구좌읍 만장굴길 182", 2, 11],
    ["hyeopjae-beach", "협재해수욕장", "제주 제주시 한림읍 한림로 329", 4, 16],
    ["hallasan", "한라산 국립공원", "제주 제주시 1100로 2070-61", 3, 21],
    ["cheonjiyeon", "천지연폭포", "제주 서귀포시 남성중로 2-15", 2, 26],
    ["jeongbang", "정방폭포", "제주 서귀포시 칠십리로214번길 37", 2, 31],
    ["jusangjeolli", "주상절리대", "제주 서귀포시 이어도로 36-30", 3, 36],
    ["camellia-hill", "카멜리아힐", "제주 서귀포시 안덕면 병악로 166", 3, 41],
    ["bijarim", "비자림", "제주 제주시 구좌읍 비자숲길 55", 2, 46],
    ["gwangchigi-beach", "광치기해변", "제주 서귀포시 성산읍 고성리", 3, 51],
    ["aewol-handam", "애월 한담해안산책로", "제주 제주시 애월읍 애월로", 3, 56],
    ["saryeoni-forest", "사려니숲길", "제주 제주시 조천읍 교래리", 2, 61],
  ],

  // 울릉도 · 독도 — 3곳
  "90": [
    ["dokdo", "독도", "경북 울릉군 울릉읍 독도리", 3, 12],
    ["dodong-trail", "울릉도 도동해안산책로", "경북 울릉군 울릉읍 도동리", 2, 18],
    ["naribunji", "나리분지", "경북 울릉군 북면 나리", 2, 24],
  ],

  // 세종특별자치시 — 잠금 지역이라 수집한 곳이 없다 (collected = 0)
  "11": [],
};

/** 도 대표 사진. 그 도 안 어느 관광지의 사진이든 가리킬 수 있다 (불변식 I2). */
const REGION_REPRESENTATIVE_PHOTO: Record<string, string | null> = {
  "1": "namsan-tower-p1",
  "32": "sokcho-yeonggeumjeong-p1", // 시안 2c — 속초 영금정 카드에 "대표" 배지
  "33": "dodamsambong-p1",
  "35": "haeundae-p1",
  "37": "jeonju-hanok-p1",
  "39": "seongsan-ilchulbong-p1",
  "90": "dokdo-p1",
  "11": null,
};

let photoPoolCursor = 0;

const nextPoolImage = () => {
  const id = PHOTO_POOL[photoPoolCursor % PHOTO_POOL.length];
  photoPoolCursor += 1;

  return photo(id);
};

const buildPhotos = (seed: PlaceSeed): DogamPhoto[] => {
  const [placeId, name, , photoCount, recentDaysAgo] = seed;

  return Array.from({ length: photoCount }, (_, index) => ({
    photoId: `${placeId}-p${index + 1}`,
    placeId,
    placeName: name,
    imageUrl: nextPoolImage(),
    // index 0 이 가장 최근. lastVerifiedAt 과 어긋나지 않게 뒤로 갈수록 오래된 사진.
    verifiedAt: daysAgo(recentDaysAgo + index * 2),
  }));
};

const buildPlace = (seed: PlaceSeed, provinceCode: string): DogamPlace => {
  const [placeId, name, address, photoCount, recentDaysAgo] = seed;

  return {
    placeId,
    provinceCode,
    name,
    address,
    photoCount,
    lastVerifiedAt: daysAgo(recentDaysAgo),
    // 사진이 없으면 대표도 없다 (불변식 I3).
    representativePhotoId: photoCount > 0 ? `${placeId}-p1` : null,
  };
};

const photosByPlaceId: Record<string, DogamPhoto[]> = {};
const placeById: Record<string, DogamPlace> = {};
const regionDetailByCode: Record<string, DogamRegionDetail> = {};

for (const region of dogamRegions) {
  const seeds = REGION_PLACE_SEEDS[region.provinceCode] ?? [];
  const places = seeds.map((seed) => buildPlace(seed, region.provinceCode));

  for (const seed of seeds) {
    photosByPlaceId[seed[0]] = buildPhotos(seed);
  }

  for (const place of places) {
    placeById[place.placeId] = place;
  }

  regionDetailByCode[region.provinceCode] = {
    region: {
      ...region,
      representativePhotoId:
        REGION_REPRESENTATIVE_PHOTO[region.provinceCode] ?? null,
    },
    places,
    // 불변식 I4 — photoTotal 은 항상 photoCount 합계에서 파생시킨다.
    photoTotal: places.reduce((sum, place) => sum + place.photoCount, 0),
  };
}

export const getMockRegionDetail = (
  provinceCode: string,
): DogamRegionDetail | undefined => {
  const detail = regionDetailByCode[provinceCode];

  return detail ? structuredClone(detail) : undefined;
};

export const getMockPlacePhotos = (
  placeId: string,
): DogamPlacePhotos | undefined => {
  const place = placeById[placeId];

  if (!place) {
    return undefined;
  }

  return structuredClone({
    place,
    photos: photosByPlaceId[placeId] ?? [],
  });
};

export const getMockRegionPhotos = (provinceCode: string): DogamPhoto[] => {
  const detail = regionDetailByCode[provinceCode];

  if (!detail) {
    return [];
  }

  // 도 대표 후보 — 그 도 모든 관광지의 사진을 평탄화한다 (FR-016a).
  return structuredClone(
    detail.places.flatMap((place) => photosByPlaceId[place.placeId] ?? []),
  );
};
