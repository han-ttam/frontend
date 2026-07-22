import type {
  DogamPhoto,
  DogamPlace,
  DogamRegionDetail,
} from "@/features/collection/types";
import { fireEvent, render } from "@testing-library/react-native";

import DogamRegionDetailPage from "../DogamRegionDetailPage";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockSetRegionRepresentative = jest.fn();

let mockParams: { code?: string } = { code: "32" };

type MockState = {
  data: DogamRegionDetail | undefined;
  regionPhotos: DogamPhoto[];
  photoById: Record<string, DogamPhoto>;
  isLoading: boolean;
  error: Error | null;
};

let mockState: MockState;

jest.mock("expo-router", () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    back: () => mockBack(),
  },
  useLocalSearchParams: () => mockParams,
}));

jest.mock("@/features/collection/useDogamRegionDetail", () => ({
  useDogamRegionDetail: () => ({
    ...mockState,
    setRegionRepresentative: mockSetRegionRepresentative,
  }),
}));

const photo = (photoId: string, placeId: string, placeName: string): DogamPhoto => ({
  photoId,
  placeId,
  placeName,
  imageUrl: `https://example.test/${photoId}.jpg`,
  verifiedAt: "2026-07-19T00:00:00.000Z",
});

const place = (
  placeId: string,
  name: string,
  photoCount: number,
  lastVerifiedAt: string,
): DogamPlace => ({
  placeId,
  provinceCode: "32",
  name,
  address: `${name} 주소`,
  photoCount,
  lastVerifiedAt,
  representativePhotoId: `${placeId}-p1`,
});

const yeonggeumjeong = place(
  "sokcho-yeonggeumjeong",
  "속초 영금정",
  5,
  "2026-07-19T00:00:00.000Z",
);
const seoraksan = place(
  "seoraksan",
  "설악산 국립공원",
  4,
  "2026-07-16T00:00:00.000Z",
);
const naksansa = place("naksansa", "낙산사", 9, "2026-07-11T00:00:00.000Z");

const photos = [
  photo("sokcho-yeonggeumjeong-p1", "sokcho-yeonggeumjeong", "속초 영금정"),
  photo("seoraksan-p1", "seoraksan", "설악산 국립공원"),
  photo("naksansa-p1", "naksansa", "낙산사"),
];

const buildState = (overrides: Partial<MockState> = {}): MockState => ({
  data: {
    region: {
      provinceCode: "32",
      name: "강원도",
      percent: 74,
      collected: 15,
      total: 21,
      locked: false,
      representativePhotoId: "sokcho-yeonggeumjeong-p1",
    },
    places: [yeonggeumjeong, seoraksan, naksansa],
    photoTotal: 41,
  },
  regionPhotos: photos,
  photoById: Object.fromEntries(photos.map((p) => [p.photoId, p])),
  isLoading: false,
  error: null,
  ...overrides,
});

describe("DogamRegionDetailPage", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
    mockSetRegionRepresentative.mockClear();
    mockParams = { code: "32" };
    mockState = buildState();
  });

  it("도 이름과 수집 현황, 사진 총 장수를 보여준다", async () => {
    const view = await render(<DogamRegionDetailPage />);

    expect(view.getByText("강원도")).toBeTruthy();
    expect(view.getByText("15")).toBeTruthy();
    expect(view.getByText("/21곳")).toBeTruthy();
    expect(view.getByText("내가 담은 강원도 · 사진 41장")).toBeTruthy();
  });

  it("제목 위에 현재 도 대표 사진과 그 장소를 보여준다", async () => {
    const view = await render(<DogamRegionDetailPage />);

    const hero = view.getByTestId("dogam-hero");

    expect(hero).toBeTruthy();
    expect(view.getByText("대표 사진")).toBeTruthy();
    // 도 전체가 후보라 어느 관광지 사진인지 함께 보여준다.
    expect(view.getAllByText("속초 영금정").length).toBeGreaterThan(1);
  });

  it("도 대표가 없어도 히어로는 보여준다 (폴백)", async () => {
    mockState = buildState();
    mockState.data = {
      ...mockState.data!,
      region: { ...mockState.data!.region, representativePhotoId: null },
    };

    const view = await render(<DogamRegionDetailPage />);

    expect(view.getByTestId("dogam-hero")).toBeTruthy();
    expect(view.queryByText("대표 사진")).toBeNull();
  });

  it("관광지 카드를 그리드로 보여준다", async () => {
    const view = await render(<DogamRegionDetailPage />);

    // 히어로도 장소명을 보여주므로 카드 쪽만 testID 로 좁혀 확인한다.
    expect(
      view.getByTestId("dogam-place-name-sokcho-yeonggeumjeong").props.children,
    ).toBe("속초 영금정");
    expect(view.getByTestId("dogam-place-name-seoraksan").props.children).toBe(
      "설악산 국립공원",
    );
    expect(view.getByTestId("dogam-place-name-naksansa").props.children).toBe(
      "낙산사",
    );
  });

  it("도 대표 사진이 속한 카드에만 대표 배지를 보여준다", async () => {
    const view = await render(<DogamRegionDetailPage />);

    expect(
      view.getByTestId("dogam-place-badge-sokcho-yeonggeumjeong"),
    ).toBeTruthy();
    expect(view.queryByTestId("dogam-place-badge-seoraksan")).toBeNull();
    expect(view.queryByTestId("dogam-place-badge-naksansa")).toBeNull();
  });

  it("기본 정렬은 서버 순서를 유지한다", async () => {
    const view = await render(<DogamRegionDetailPage />);
    const names = view
      .getAllByTestId(/^dogam-place-name-/)
      .map((node) => node.props.children);

    expect(names).toEqual(["속초 영금정", "설악산 국립공원", "낙산사"]);
  });

  it("사진 많은순 칩을 누르면 순서가 바뀐다", async () => {
    const view = await render(<DogamRegionDetailPage />);

    await fireEvent.press(view.getByTestId("dogam-sort-mostPhotos"));

    const names = view
      .getAllByTestId(/^dogam-place-name-/)
      .map((node) => node.props.children);

    expect(names).toEqual(["낙산사", "속초 영금정", "설악산 국립공원"]);
  });

  it("최근순 칩을 누르면 최근 인증 순으로 바뀐다", async () => {
    const view = await render(<DogamRegionDetailPage />);

    await fireEvent.press(view.getByTestId("dogam-sort-recent"));

    const names = view
      .getAllByTestId(/^dogam-place-name-/)
      .map((node) => node.props.children);

    expect(names).toEqual(["속초 영금정", "설악산 국립공원", "낙산사"]);
  });

  it("관광지 카드를 누르면 사진첩으로 이동한다", async () => {
    const view = await render(<DogamRegionDetailPage />);

    await fireEvent.press(view.getByTestId("dogam-place-sokcho-yeonggeumjeong"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/collection/place/[id]",
      params: { id: "sokcho-yeonggeumjeong" },
    });
  });

  it("뒤로 가기를 누르면 도감으로 돌아간다", async () => {
    const view = await render(<DogamRegionDetailPage />);

    await fireEvent.press(view.getByTestId("dogam-region-back"));

    expect(mockBack).toHaveBeenCalled();
  });

  describe("도 대표 선택 시트", () => {
    it("진입점을 누르면 시트가 열린다", async () => {
      const view = await render(<DogamRegionDetailPage />);

      expect(view.queryByTestId("dogam-rep-sheet")).toBeNull();

      await fireEvent.press(view.getByTestId("dogam-rep-open"));

      expect(view.getByTestId("dogam-rep-sheet")).toBeTruthy();
      expect(view.getByText("대표 사진 선택")).toBeTruthy();
      expect(
        view.getByText("강원도에서 인증한 사진 3장 중에서 골라요"),
      ).toBeTruthy();
    });

    it("후보에 여러 관광지 사진이 섞여 나온다 (FR-016a)", async () => {
      const view = await render(<DogamRegionDetailPage />);

      await fireEvent.press(view.getByTestId("dogam-rep-open"));

      expect(
        view.getByTestId("dogam-rep-thumb-sokcho-yeonggeumjeong-p1"),
      ).toBeTruthy();
      expect(view.getByTestId("dogam-rep-thumb-seoraksan-p1")).toBeTruthy();
      expect(view.getByTestId("dogam-rep-thumb-naksansa-p1")).toBeTruthy();
    });

    it("썸네일을 눌러도 확정 전에는 대표가 바뀌지 않는다 (FR-019)", async () => {
      const view = await render(<DogamRegionDetailPage />);

      await fireEvent.press(view.getByTestId("dogam-rep-open"));
      await fireEvent.press(view.getByTestId("dogam-rep-thumb-seoraksan-p1"));

      expect(mockSetRegionRepresentative).not.toHaveBeenCalled();
    });

    it("미리보기가 선택한 사진의 장소와 날짜를 보여준다", async () => {
      const view = await render(<DogamRegionDetailPage />);

      await fireEvent.press(view.getByTestId("dogam-rep-open"));
      await fireEvent.press(view.getByTestId("dogam-rep-thumb-naksansa-p1"));

      expect(view.getByText("낙산사 · 2026.07.19")).toBeTruthy();
    });

    it("취소하면 대표를 바꾸지 않고 닫는다", async () => {
      const view = await render(<DogamRegionDetailPage />);

      await fireEvent.press(view.getByTestId("dogam-rep-open"));
      await fireEvent.press(view.getByTestId("dogam-rep-thumb-seoraksan-p1"));
      await fireEvent.press(view.getByTestId("dogam-rep-cancel"));

      expect(mockSetRegionRepresentative).not.toHaveBeenCalled();
      expect(view.queryByTestId("dogam-rep-sheet")).toBeNull();
    });

    it("대표로 지정하면 확정되고 닫힌다", async () => {
      const view = await render(<DogamRegionDetailPage />);

      await fireEvent.press(view.getByTestId("dogam-rep-open"));
      await fireEvent.press(view.getByTestId("dogam-rep-thumb-seoraksan-p1"));
      await fireEvent.press(view.getByTestId("dogam-rep-confirm"));

      expect(mockSetRegionRepresentative).toHaveBeenCalledWith("seoraksan-p1");
      expect(view.queryByTestId("dogam-rep-sheet")).toBeNull();
    });

    it("취소 후 다시 열면 저장된 대표에서 다시 시작한다", async () => {
      const view = await render(<DogamRegionDetailPage />);

      await fireEvent.press(view.getByTestId("dogam-rep-open"));
      await fireEvent.press(view.getByTestId("dogam-rep-thumb-seoraksan-p1"));
      await fireEvent.press(view.getByTestId("dogam-rep-cancel"));
      await fireEvent.press(view.getByTestId("dogam-rep-open"));

      expect(view.getByText("속초 영금정 · 2026.07.19")).toBeTruthy();
    });

    it("후보 사진이 없으면 진입점을 두지 않는다", async () => {
      mockState = buildState({ regionPhotos: [], photoById: {} });

      const view = await render(<DogamRegionDetailPage />);

      expect(view.queryByTestId("dogam-rep-open")).toBeNull();
    });
  });

  it("관광지가 없으면 안내 문구를 보여주고 인증 화면으로 보내지 않는다", async () => {
    mockState = buildState({
      data: {
        region: {
          provinceCode: "32",
          name: "강원도",
          percent: 0,
          collected: 0,
          total: 21,
          locked: false,
          representativePhotoId: null,
        },
        places: [],
        photoTotal: 0,
      },
      regionPhotos: [],
      photoById: {},
    });

    const view = await render(<DogamRegionDetailPage />);

    expect(view.getByText("아직 이 지역에서 인증한 사진이 없어요.")).toBeTruthy();
    expect(view.queryByTestId("dogam-go-verify")).toBeNull();
  });
});
