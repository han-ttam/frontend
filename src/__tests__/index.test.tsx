import { act, render } from "@testing-library/react-native";

import HomeScreen from "../app/index";

const mockRedirect = jest.fn();
let mockMapState = {
  data: undefined as unknown,
  error: undefined as Error | undefined,
  isLoading: true,
};

jest.mock("expo-router", () => ({
  Redirect: (props: unknown) => {
    mockRedirect(props);
    return null;
  },
}));

jest.mock("@/pages/landing/LandingPage", () => {
  return function MockLandingPage() {
    return null;
  };
});

jest.mock("@/features/map/useMapData", () => ({
  useMapData: () => mockMapState,
}));

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockRedirect.mockClear();
    mockMapState = {
      data: undefined,
      error: undefined,
      isLoading: true,
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the landing page while data is unavailable", async () => {
    const view = await render(<HomeScreen />);

    expect(view).toBeTruthy();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("keeps the landing page visible until the minimum duration passes", async () => {
    mockMapState = {
      data: {
        summary: {
          score: 0,
          nationalRank: 0,
          totalUsers: 0,
          progress: {
            percent: 0,
            collected: 0,
            total: 0,
          },
        },
        provinces: [],
        todayDiscoveries: [],
      },
      error: undefined,
      isLoading: false,
    };

    await render(<HomeScreen />);

    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("redirects to the map after map data is loaded and the completion hold passes", async () => {
    mockMapState = {
      data: {
        summary: {
          score: 0,
          nationalRank: 0,
          totalUsers: 0,
          progress: {
            percent: 0,
            collected: 0,
            total: 0,
          },
        },
        provinces: [],
        todayDiscoveries: [],
      },
      error: undefined,
      isLoading: false,
    };

    const view = await render(<HomeScreen />);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(2400);
    });
    await act(async () => {
      view.rerender(<HomeScreen />);
    });

    expect(mockRedirect).not.toHaveBeenCalled();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(350);
    });
    await act(async () => {
      view.rerender(<HomeScreen />);
    });

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/map" }),
    );
  });
});
