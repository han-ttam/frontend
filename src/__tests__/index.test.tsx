import { act, render } from "@testing-library/react-native";

import HomeScreen from "../app/index";

const mockRedirect = jest.fn();
let mockMapState = {
  data: undefined as unknown,
  error: undefined as Error | undefined,
  isLoading: true,
};
let mockAuthState = {
  hasSkippedLogin: false,
  isAuthenticated: false,
  isHydrated: true,
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

jest.mock("@/stores/authStore", () => ({
  useAuth: () => mockAuthState,
}));

const loadedMapState = {
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

const settleLanding = async (view: Awaited<ReturnType<typeof render>>) => {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(2400);
  });
  await act(async () => {
    view.rerender(<HomeScreen />);
  });
  await act(async () => {
    await jest.advanceTimersByTimeAsync(350);
  });
  await act(async () => {
    view.rerender(<HomeScreen />);
  });
};

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockRedirect.mockClear();
    mockMapState = {
      data: undefined,
      error: undefined,
      isLoading: true,
    };
    mockAuthState = {
      hasSkippedLogin: false,
      isAuthenticated: false,
      isHydrated: true,
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
    mockMapState = loadedMapState;

    await render(<HomeScreen />);

    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("suggests login to a guest who has not skipped it yet", async () => {
    mockMapState = loadedMapState;

    const view = await render(<HomeScreen />);
    await settleLanding(view);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/login" }),
    );
  });

  it("redirects to the map once the guest has skipped login", async () => {
    mockMapState = loadedMapState;
    mockAuthState = {
      hasSkippedLogin: true,
      isAuthenticated: false,
      isHydrated: true,
    };

    const view = await render(<HomeScreen />);
    await settleLanding(view);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/map" }),
    );
  });

  it("redirects a signed-in user straight to the map", async () => {
    mockMapState = loadedMapState;
    mockAuthState = {
      hasSkippedLogin: false,
      isAuthenticated: true,
      isHydrated: true,
    };

    const view = await render(<HomeScreen />);
    await settleLanding(view);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/map" }),
    );
  });

  it("waits for the stored session to load before redirecting", async () => {
    mockMapState = loadedMapState;
    mockAuthState = {
      hasSkippedLogin: false,
      isAuthenticated: false,
      isHydrated: false,
    };

    const view = await render(<HomeScreen />);
    await settleLanding(view);

    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
