export type DogamTab = "regions" | "themes" | "recent";

export type DogamOverview = {
  percent: number;
  collected: number;
  total: number;
};

export type DogamRegion = {
  provinceCode: string;
  name: string;
  percent: number;
  collected: number;
  total: number;
  locked: boolean;
  imageUrl?: string | null;
  /** 도 대표 사진. 그 도 안 어느 관광지의 사진이든 가리킬 수 있다. */
  representativePhotoId?: string | null;
};

export type DogamTheme = {
  collectionId: string;
  title: string;
  filled: number;
  total: number;
  thumbnails: string[];
};

export type DogamThemes = {
  items: DogamTheme[];
  nextCursor: string | null;
};

export type DogamRecentItem = {
  placeId: string;
  name: string;
  imageUrl: string | null;
  collectedAt: string;
};

export type DogamRecent = {
  items: DogamRecentItem[];
  nextCursor: string | null;
};

/** 관광지 한 곳. 도감 도 상세의 2열 카드 하나에 대응한다. */
export type DogamPlace = {
  placeId: string;
  provinceCode: string;
  name: string;
  address: string;
  /** 정렬("사진 많은순") 키. photos.length 와 일치해야 한다. */
  photoCount: number;
  /** 정렬("최근순") 키. 그 관광지 사진 중 가장 늦은 verifiedAt. */
  lastVerifiedAt: string;
  /** 관광지 대표 사진. 반드시 그 관광지 사진이거나 null. */
  representativePhotoId: string | null;
};

/** 사용자가 한 관광지에서 위치 기반으로 인증한 사진 한 장. */
export type DogamPhoto = {
  photoId: string;
  placeId: string;
  /** 비정규화. 도 대표 선택 시트는 여러 관광지 사진을 섞어 보여주므로 사진마다 장소명이 필요하다. */
  placeName: string;
  imageUrl: string;
  verifiedAt: string;
};

export type DogamRegionDetail = {
  region: DogamRegion;
  places: DogamPlace[];
  /** places 의 photoCount 합계와 일치해야 한다. */
  photoTotal: number;
};

export type DogamPlacePhotos = {
  place: DogamPlace;
  photos: DogamPhoto[];
};

export type PlaceSort = "all" | "recent" | "mostPhotos";
