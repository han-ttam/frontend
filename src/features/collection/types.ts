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
