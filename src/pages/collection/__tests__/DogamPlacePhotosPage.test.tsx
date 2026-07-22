import type {
  DogamPhoto,
  DogamPlace,
  DogamPlacePhotos,
} from "@/features/collection/types";
import { fireEvent, render } from "@testing-library/react-native";

import DogamPlacePhotosPage from "../DogamPlacePhotosPage";

const mockBack = jest.fn();
const mockSetPlaceRepresentative = jest.fn();

let mockParams: { id?: string } = { id: "sokcho-yeonggeumjeong" };

type MockState = {
  data: DogamPlacePhotos | undefined;
  isLoading: boolean;
  error: Error | null;
};

let mockState: MockState;

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    back: () => mockBack(),
  },
  useLocalSearchParams: () => mockParams,
}));

jest.mock("@/features/collection/useDogamPlacePhotos", () => ({
  useDogamPlacePhotos: () => ({
    ...mockState,
    setPlaceRepresentative: mockSetPlaceRepresentative,
  }),
}));

const place: DogamPlace = {
  placeId: "sokcho-yeonggeumjeong",
  provinceCode: "32",
  name: "속초 영금정",
  address: "속초시 영금정로 43",
  photoCount: 5,
  lastVerifiedAt: "2026-07-19T00:00:00.000Z",
  representativePhotoId: "sokcho-yeonggeumjeong-p1",
};

const photos: DogamPhoto[] = Array.from({ length: 5 }, (_, index) => ({
  photoId: `sokcho-yeonggeumjeong-p${index + 1}`,
  placeId: "sokcho-yeonggeumjeong",
  placeName: "속초 영금정",
  imageUrl: `https://example.test/p${index + 1}.jpg`,
  verifiedAt: `2026-07-${19 - index}T00:00:00.000Z`,
}));

const buildState = (overrides: Partial<MockState> = {}): MockState => ({
  data: { place, photos },
  isLoading: false,
  error: null,
  ...overrides,
});

describe("DogamPlacePhotosPage", () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockSetPlaceRepresentative.mockClear();
    mockParams = { id: "sokcho-yeonggeumjeong" };
    mockState = buildState();
  });

  it("관광지 이름과 주소, 인증 사진 장수를 보여준다", async () => {
    const view = await render(<DogamPlacePhotosPage />);

    expect(view.getByText("속초 영금정")).toBeTruthy();
    expect(view.getByText("속초시 영금정로 43 · 내 인증 사진 5장")).toBeTruthy();
  });

  it("인증 사진을 그리드로 보여준다", async () => {
    const view = await render(<DogamPlacePhotosPage />);

    photos.forEach((photo) => {
      expect(view.getByTestId(`dogam-photo-${photo.photoId}`)).toBeTruthy();
    });
  });

  it("현재 대표 사진에만 대표 배지를 보여준다", async () => {
    const view = await render(<DogamPlacePhotosPage />);

    expect(
      view.getByTestId("dogam-photo-badge-sokcho-yeonggeumjeong-p1"),
    ).toBeTruthy();
    expect(
      view.queryByTestId("dogam-photo-badge-sokcho-yeonggeumjeong-p2"),
    ).toBeNull();
  });

  it("제목 위에 현재 대표 사진을 보여준다", async () => {
    const view = await render(<DogamPlacePhotosPage />);

    expect(view.getByTestId("dogam-hero")).toBeTruthy();
    expect(view.getByText("대표 사진")).toBeTruthy();
  });

  it("안내 문구를 보여준다", async () => {
    const view = await render(<DogamPlacePhotosPage />);

    expect(view.getByText("사진을 탭하면 크게 볼 수 있어요.")).toBeTruthy();
    expect(
      view.getByText("대표 사진은 도감 카드 표지로 보여져요."),
    ).toBeTruthy();
  });

  describe("확대 보기", () => {
    it("사진을 탭하면 확대 보기가 열린다", async () => {
      const view = await render(<DogamPlacePhotosPage />);

      expect(view.queryByTestId("dogam-viewer-close")).toBeNull();

      await fireEvent.press(
        view.getByTestId("dogam-photo-sokcho-yeonggeumjeong-p3"),
      );

      expect(view.getByTestId("dogam-viewer-close")).toBeTruthy();
      expect(
        view.getByTestId("dogam-viewer-image-sokcho-yeonggeumjeong-p3"),
      ).toBeTruthy();
    });

    it("탭만으로는 대표가 바뀌지 않는다", async () => {
      const view = await render(<DogamPlacePhotosPage />);

      await fireEvent.press(
        view.getByTestId("dogam-photo-sokcho-yeonggeumjeong-p3"),
      );

      expect(mockSetPlaceRepresentative).not.toHaveBeenCalled();
    });

    it("이미 대표인 사진도 확대할 수 있다", async () => {
      const view = await render(<DogamPlacePhotosPage />);

      await fireEvent.press(
        view.getByTestId("dogam-photo-sokcho-yeonggeumjeong-p1"),
      );

      expect(
        view.getByTestId("dogam-viewer-image-sokcho-yeonggeumjeong-p1"),
      ).toBeTruthy();
    });

    it("장소와 위치를 함께 보여준다", async () => {
      const view = await render(<DogamPlacePhotosPage />);

      await fireEvent.press(
        view.getByTestId("dogam-photo-sokcho-yeonggeumjeong-p2"),
      );

      expect(view.getByText("2 / 5")).toBeTruthy();
    });

    it("다음·이전으로 넘길 수 있다", async () => {
      const view = await render(<DogamPlacePhotosPage />);

      await fireEvent.press(
        view.getByTestId("dogam-photo-sokcho-yeonggeumjeong-p1"),
      );
      await fireEvent.press(view.getByTestId("dogam-viewer-next"));

      expect(
        view.getByTestId("dogam-viewer-image-sokcho-yeonggeumjeong-p2"),
      ).toBeTruthy();

      await fireEvent.press(view.getByTestId("dogam-viewer-prev"));

      expect(
        view.getByTestId("dogam-viewer-image-sokcho-yeonggeumjeong-p1"),
      ).toBeTruthy();
    });

    it("닫으면 사라진다", async () => {
      const view = await render(<DogamPlacePhotosPage />);

      await fireEvent.press(
        view.getByTestId("dogam-photo-sokcho-yeonggeumjeong-p1"),
      );
      await fireEvent.press(view.getByTestId("dogam-viewer-close"));

      expect(view.queryByTestId("dogam-viewer-close")).toBeNull();
    });
  });

  describe("대표 사진 변경", () => {
    it("버튼을 누르면 시트가 열리고 그 관광지 사진만 후보로 나온다", async () => {
      const view = await render(<DogamPlacePhotosPage />);

      await fireEvent.press(view.getByTestId("dogam-rep-open"));

      expect(view.getByTestId("dogam-rep-sheet")).toBeTruthy();
      expect(
        view.getByText("속초 영금정에서 인증한 사진 5장 중에서 골라요"),
      ).toBeTruthy();
    });

    it("확정 전에는 대표가 바뀌지 않는다", async () => {
      const view = await render(<DogamPlacePhotosPage />);

      await fireEvent.press(view.getByTestId("dogam-rep-open"));
      await fireEvent.press(
        view.getByTestId("dogam-rep-thumb-sokcho-yeonggeumjeong-p4"),
      );

      expect(mockSetPlaceRepresentative).not.toHaveBeenCalled();
    });

    it("대표로 지정하면 확정된다", async () => {
      const view = await render(<DogamPlacePhotosPage />);

      await fireEvent.press(view.getByTestId("dogam-rep-open"));
      await fireEvent.press(
        view.getByTestId("dogam-rep-thumb-sokcho-yeonggeumjeong-p4"),
      );
      await fireEvent.press(view.getByTestId("dogam-rep-confirm"));

      expect(mockSetPlaceRepresentative).toHaveBeenCalledWith(
        "sokcho-yeonggeumjeong-p4",
      );
      expect(view.queryByTestId("dogam-rep-sheet")).toBeNull();
    });

    it("취소하면 바뀌지 않는다", async () => {
      const view = await render(<DogamPlacePhotosPage />);

      await fireEvent.press(view.getByTestId("dogam-rep-open"));
      await fireEvent.press(
        view.getByTestId("dogam-rep-thumb-sokcho-yeonggeumjeong-p4"),
      );
      await fireEvent.press(view.getByTestId("dogam-rep-cancel"));

      expect(mockSetPlaceRepresentative).not.toHaveBeenCalled();
      expect(view.queryByTestId("dogam-rep-sheet")).toBeNull();
    });
  });

  it("사진 추가 진입점을 두지 않는다", async () => {
    const view = await render(<DogamPlacePhotosPage />);

    expect(view.queryByTestId("dogam-photo-add")).toBeNull();
  });

  it("사진이 없으면 빈 상태를 보여주고 히어로·대표 변경을 감춘다", async () => {
    mockState = buildState({
      data: {
        place: { ...place, photoCount: 0, representativePhotoId: null },
        photos: [],
      },
    });

    const view = await render(<DogamPlacePhotosPage />);

    expect(
      view.getByText("아직 이 여행지에서 인증한 사진이 없어요."),
    ).toBeTruthy();
    expect(view.queryByTestId("dogam-photo-add")).toBeNull();
    expect(view.queryByTestId("dogam-hero")).toBeNull();
    expect(view.queryByTestId("dogam-rep-open")).toBeNull();
  });

  it("뒤로 가기를 누르면 이전 화면으로 돌아간다", async () => {
    const view = await render(<DogamPlacePhotosPage />);

    await fireEvent.press(view.getByTestId("dogam-place-back"));

    expect(mockBack).toHaveBeenCalled();
  });
});
