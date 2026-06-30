import { FontAwesome6 } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type RecommendationIcon = ComponentProps<typeof FontAwesome6>["name"];

type Recommendation = {
  id: string;
  title: string;
  location: string;
  accent: string;
  icon: RecommendationIcon;
};

export const recommendations = [
  {
    id: "busan-gijang-coast",
    title: "부산 기장 해안길",
    location: "부산 기장군",
    accent: "#376F85",
    icon: "water",
  },
  {
    id: "jeonju-hanok-village",
    title: "전주 한옥마을",
    location: "전북 전주시",
    accent: "#8B5D38",
    icon: "landmark",
  },
  {
    id: "seongsan-sunrise-peak",
    title: "성산일출봉",
    location: "제주 서귀포시",
    accent: "#617C45",
    icon: "mountain-sun",
  },
] as const satisfies readonly Recommendation[];

export type RecommendationId = (typeof recommendations)[number]["id"];
