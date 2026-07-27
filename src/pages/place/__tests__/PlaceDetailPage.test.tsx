import type { PlaceDetailData } from "@/features/place/usePlaceDetailData";
import { fireEvent, render, screen } from "@testing-library/react-native";

import PlaceDetailPage from "../PlaceDetailPage";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReload = jest.fn();

let mockParams: { id?: string } = { id: "place-1" };
let mockState: {
  data: PlaceDetailData | undefined;
  error: Error | null;
  isLoading: boolean;
} = {
  data: undefined,
  error: null,
  isLoading: false,
};

jest.mock("expo-router", () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    back: () => mockBack(),
  },
  useLocalSearchParams: () => mockParams,
}));

jest.mock("@/features/place/usePlaceDetailData", () => ({
  usePlaceDetailData: () => ({ ...mockState, reload: mockReload }),
}));

const emptyPlace: PlaceDetailData = {
  place: {
    id: "place-1",
    regionCode: "32_16",
    name: "속초 영금정",
    address: "강원도 속초시 영금정로 43",
    description: null,
    mission: null,
    tags: [],
    rarityWeight: 1,
    imageUrl: null,
    rating: null,
    ratingCount: 0,
    myRating: null,
    visitStatus: "NONE",
    lat: 38.2,
    lng: 128.6,
  },
  scoring: {
    action: "CERT_PHOTO",
    basePoints: 15,
    regionWeight: 1.5,
    rarityWeight: 1,
    eventMultiplier: 1,
    estimatedPoints: 22.5,
  },
  compositions: [],
  certifications: { items: [], nextCursor: null },
};

const filledPlace: PlaceDetailData = {
  place: {
    ...emptyPlace.place,
    description: "동해 일출 명소예요.",
    mission: "영금정 정자와 동해 바다가 함께 보이는 사진을 인증해주세요!",
    tags: ["동해바다", "일출명소"],
    imageUrl: "https://example.test/yeonggeumjeong.jpg",
    rating: 4.8,
    ratingCount: 21,
    visitStatus: "VISITED",
  },
  scoring: emptyPlace.scoring,
  compositions: [
    {
      seq: 1,
      title: "정자 + 동해 바다",
      description: "정자와 넓은 바다를 함께 담아보세요.",
      exampleImageUrl: "https://example.test/composition-1.jpg",
      source: "CURATED",
    },
  ],
  certifications: {
    items: [{ imageUrl: "https://example.test/cert-1.jpg", userHandle: "hyun" }],
    nextCursor: null,
  },
};

describe("PlaceDetailPage", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
    mockReload.mockClear();
    mockParams = { id: "place-1" };
    mockState = { data: emptyPlace, error: null, isLoading: false };
  });

  it("shows the place name, address and score from the API", async () => {
    await render(<PlaceDetailPage />);

    expect(screen.getByText("속초 영금정")).toBeTruthy();
    expect(screen.getByText("강원도 속초시 영금정로 43")).toBeTruthy();
    expect(screen.getByText("15")).toBeTruthy();
    expect(screen.getByText("×1.5")).toBeTruthy();
    expect(screen.getByText("지금 인증하면 예상 22.5점")).toBeTruthy();
  });

  it("falls back to the default mission and dashes the rating when the server has neither", async () => {
    await render(<PlaceDetailPage />);

    expect(
      screen.getByText("이 장소의 대표적인 모습이 담긴 사진을 인증해주세요!"),
    ).toBeTruthy();
    expect(screen.getByText("–")).toBeTruthy();
  });

  it("explains the empty composition and certification sections", async () => {
    await render(<PlaceDetailPage />);

    expect(screen.getByText("아직 등록된 구도 가이드가 없어요.")).toBeTruthy();
    expect(screen.getByText("아직 인증 사진이 없어요.")).toBeTruthy();
  });

  it("renders server content when the place is filled in", async () => {
    mockState = { data: filledPlace, error: null, isLoading: false };

    await render(<PlaceDetailPage />);

    expect(screen.getByText("#동해바다")).toBeTruthy();
    expect(screen.getByText("4.8")).toBeTruthy();
    expect(screen.getByText("방문 완료")).toBeTruthy();
    expect(screen.getByText("정자 + 동해 바다")).toBeTruthy();
    expect(screen.getByLabelText("hyun님의 인증 사진")).toBeTruthy();
    expect(
      screen.getByText("영금정 정자와 동해 바다가 함께 보이는 사진을 인증해주세요!"),
    ).toBeTruthy();
    expect(screen.queryByText("아직 인증 사진이 없어요.")).toBeNull();
  });

  it("sends the traveler to the photo tab from the CTA", async () => {
    await render(<PlaceDetailPage />);

    await fireEvent.press(screen.getByLabelText("이 장소 인증하기"));

    expect(mockPush).toHaveBeenCalledWith("/photo");
  });

  it("goes back from the hero button", async () => {
    await render(<PlaceDetailPage />);

    await fireEvent.press(screen.getByLabelText("뒤로 가기"));

    expect(mockBack).toHaveBeenCalled();
  });

  it("offers a retry when the place fails to load", async () => {
    mockState = {
      data: undefined,
      error: new Error("GET /api/places/place-1 failed with HTTP 500"),
      isLoading: false,
    };

    await render(<PlaceDetailPage />);

    expect(screen.getByText("여행지를 불러오지 못했어요")).toBeTruthy();
    await fireEvent.press(screen.getByLabelText("다시 시도"));

    expect(mockReload).toHaveBeenCalled();
  });
});
