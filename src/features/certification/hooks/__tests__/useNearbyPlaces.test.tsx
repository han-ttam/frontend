import { act, renderHook, waitFor } from "@testing-library/react-native";

import { useNearbyPlaces } from "../useNearbyPlaces";

const mockRequestPermissions = jest.fn();
const mockGetLastKnown = jest.fn();
const mockGetCurrent = jest.fn();

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: (...args: unknown[]) => mockRequestPermissions(...args),
  getLastKnownPositionAsync: (...args: unknown[]) => mockGetLastKnown(...args),
  getCurrentPositionAsync: (...args: unknown[]) => mockGetCurrent(...args),
}));

const mockGetNearbyPlaces = jest.fn();
jest.mock("../../index", () => ({
  getNearbyPlaces: (...args: unknown[]) => mockGetNearbyPlaces(...args),
}));

/** locationCache 는 모듈 전역이라 테스트 사이로 값이 새어 나간다 — 테스트마다 비운다. */
let mockCachedLocation: { lat: number; lng: number } | null = null;
jest.mock("../../locationCache", () => ({
  getCachedLocation: () => mockCachedLocation,
  setCachedLocation: (lat: number, lng: number) => {
    mockCachedLocation = { lat, lng };
  },
}));

const PLACES = [{ id: "p1", name: "춘천향교", rarityWeight: 1, distanceMeters: 402 }];
const position = (latitude: number, longitude: number) => ({ coords: { latitude, longitude } });

// 테스트 본문에서 useRealTimers 를 부르면 앞선 expect 가 던졌을 때 가짜 타이머가 다음 테스트로 샌다.
afterEach(() => {
  jest.useRealTimers();
});

beforeEach(() => {
  jest.clearAllMocks();
  mockCachedLocation = null;
  mockRequestPermissions.mockResolvedValue({ status: "granted" });
  mockGetNearbyPlaces.mockResolvedValue(PLACES);
});

describe("useNearbyPlaces 좌표 확보", () => {
  it("마지막으로 알던 위치가 있으면 그걸 쓰고 새 fix 를 기다리지 않는다", async () => {
    mockGetLastKnown.mockResolvedValue(position(37.88, 127.73));

    const { result } = await renderHook(() => useNearbyPlaces());

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.places).toEqual(PLACES);
    // 이게 핵심 — GPS 콜드스타트로 화면이 멈추지 않으려면 여기서 끝나야 한다.
    expect(mockGetCurrent).not.toHaveBeenCalled();
    expect(mockGetNearbyPlaces).toHaveBeenCalledWith({ lat: 37.88, lng: 127.73, radius: 2000, limit: 20 });
  });

  it("마지막 위치가 없으면 현재 위치를 조회한다", async () => {
    mockGetLastKnown.mockResolvedValue(null);
    mockGetCurrent.mockResolvedValue(position(37.5, 127.0));

    const { result } = await renderHook(() => useNearbyPlaces());

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(mockGetCurrent).toHaveBeenCalled();
    expect(mockGetNearbyPlaces).toHaveBeenCalledWith({ lat: 37.5, lng: 127.0, radius: 2000, limit: 20 });
  });

  it("현재 위치 조회가 끝나지 않으면 무한 대기하지 않고 location-error 로 끝낸다", async () => {
    jest.useFakeTimers();
    mockGetLastKnown.mockResolvedValue(null);
    mockGetCurrent.mockReturnValue(new Promise(() => {})); // 영원히 pending — 에뮬레이터/실내 GPS 재현

    const { result } = await renderHook(() => useNearbyPlaces());

    await act(async () => {
      await jest.advanceTimersByTimeAsync(9_000);
    });

    await waitFor(() => expect(result.current.status).toBe("location-error"));
    expect(mockGetNearbyPlaces).not.toHaveBeenCalled();
  });

  it("권한이 없으면 denied 로 끝낸다", async () => {
    mockRequestPermissions.mockResolvedValue({ status: "denied" });

    const { result } = await renderHook(() => useNearbyPlaces());

    await waitFor(() => expect(result.current.status).toBe("denied"));
    expect(mockGetLastKnown).not.toHaveBeenCalled();
  });

  it("캐시된 위치가 있으면 즉시 렌더하고 백그라운드로 한 번 더 갱신한다", async () => {
    mockCachedLocation = { lat: 37.88, lng: 127.73 };
    mockGetLastKnown.mockResolvedValue(position(37.88, 127.73));

    const { result } = await renderHook(() => useNearbyPlaces());

    await waitFor(() => expect(result.current.status).toBe("ready"));
    // 캐시 좌표로 한 번, 그 뒤 백그라운드 갱신으로 또 한 번.
    await waitFor(() => expect(mockGetNearbyPlaces).toHaveBeenCalledTimes(2));
  });

  it("백그라운드 갱신이 실패해도 보고 있던 목록을 지우지 않는다", async () => {
    mockCachedLocation = { lat: 37.88, lng: 127.73 };
    mockGetLastKnown.mockResolvedValue(position(37.88, 127.73));
    mockGetNearbyPlaces
      .mockResolvedValueOnce(PLACES) // 캐시 좌표 조회는 성공
      .mockRejectedValueOnce(new Error("boom")); // 백그라운드 갱신은 실패

    const { result } = await renderHook(() => useNearbyPlaces());

    await waitFor(() => expect(mockGetNearbyPlaces).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.refreshing).toBe(false));
    // 화면을 갈아엎지 않는 게 이 분기의 계약이다.
    expect(result.current.status).toBe("ready");
    expect(result.current.places).toEqual(PLACES);
  });

  it("캐시 좌표로 조회가 실패하면 전체 재조회로 폴백한다", async () => {
    mockCachedLocation = { lat: 1, lng: 2 };
    mockGetNearbyPlaces.mockRejectedValueOnce(new Error("stale"));
    mockGetLastKnown.mockResolvedValue(position(37.88, 127.73));

    const { result } = await renderHook(() => useNearbyPlaces());

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(mockGetLastKnown).toHaveBeenCalled();
    expect(mockGetNearbyPlaces).toHaveBeenLastCalledWith({
      lat: 37.88,
      lng: 127.73,
      radius: 2000,
      limit: 20,
    });
  });

  it("좌표는 얻었는데 조회가 실패하면 data-error 로 구분한다", async () => {
    mockGetLastKnown.mockResolvedValue(position(37.88, 127.73));
    mockGetNearbyPlaces.mockRejectedValue(new Error("boom"));

    const { result } = await renderHook(() => useNearbyPlaces());

    await waitFor(() => expect(result.current.status).toBe("data-error"));
  });
});
