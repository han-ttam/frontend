import { useCallback, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";

import { getNearbyPlaces } from "../index";
import { getCachedLocation, setCachedLocation } from "../locationCache";
import type { NearbyPlace } from "../types";

const RADIUS_METERS = 2000;
const LIMIT = 20;

/** location-error 와 data-error 를 나눠 두는 이유: 예전엔 둘 다 "error" 라서 서버가 죽어도 화면이 위치 탓을 했다. */
type Status = "loading" | "denied" | "location-error" | "data-error" | "ready";

interface NearbyState {
  status: Status;
  places: NearbyPlace[];
  refreshing: boolean;
}

type CoordsOutcome =
  | { kind: "ok"; latitude: number; longitude: number }
  | { kind: "denied" }
  | { kind: "error" };

/** 마지막으로 알던 위치를 재사용할 수 있는 한계. 이보다 오래된 좌표로 "근처"를 말하면 거짓말이 된다. */
const LAST_KNOWN_MAX_AGE_MS = 5 * 60 * 1000;

/** getCurrentPositionAsync 는 새 위성 fix 를 기다리며 스스로 끝나지 않는다 — 이 시간이 지나면 포기한다. */
const CURRENT_POSITION_TIMEOUT_MS = 8_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("LOCATION_TIMEOUT")), ms);
    promise.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

async function resolveCoords(): Promise<CoordsOutcome> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return { kind: "denied" };

    // 마지막으로 알던 위치를 먼저 쓴다 — GPS 콜드스타트(실내·지하)에서 화면이 무한 로딩에 걸리는 걸 막는다.
    const last = await Location.getLastKnownPositionAsync({ maxAge: LAST_KNOWN_MAX_AGE_MS });
    if (last) {
      return { kind: "ok", latitude: last.coords.latitude, longitude: last.coords.longitude };
    }

    const current = await withTimeout(Location.getCurrentPositionAsync({}), CURRENT_POSITION_TIMEOUT_MS);
    return { kind: "ok", latitude: current.coords.latitude, longitude: current.coords.longitude };
  } catch {
    return { kind: "error" };
  }
}

/** 인증 탭 진입 시 GPS 기반 근처 장소를 불러온다 — 위치 캐시(TTL 60초)로 재진입 시 즉시 렌더 후 백그라운드 갱신. */
export function useNearbyPlaces() {
  const [state, setState] = useState<NearbyState>({ status: "loading", places: [], refreshing: false });
  const mountedRef = useRef(true);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    [],
  );

  const fetchNearby = useCallback(
    (lat: number, lng: number) => getNearbyPlaces({ lat, lng, radius: RADIUS_METERS, limit: LIMIT }),
    [],
  );

  const loadFresh = useCallback(
    async (background: boolean) => {
      if (background) {
        setState((s) => ({ ...s, refreshing: true }));
      } else {
        setState({ status: "loading", places: [], refreshing: false });
      }

      // 백그라운드 갱신 실패는 화면을 갈아엎지 않는다 — 이미 보고 있는 목록을 그대로 둔다.
      const fail = (status: "location-error" | "data-error") => {
        if (!mountedRef.current) return;
        setState((s) => (background ? { ...s, refreshing: false } : { status, places: [], refreshing: false }));
      };

      const coords = await resolveCoords();
      if (coords.kind === "denied") {
        if (mountedRef.current) setState({ status: "denied", places: [], refreshing: false });
        return;
      }
      if (coords.kind === "error") {
        fail("location-error");
        return;
      }

      setCachedLocation(coords.latitude, coords.longitude);

      try {
        const places = await fetchNearby(coords.latitude, coords.longitude);
        if (mountedRef.current) setState({ status: "ready", places, refreshing: false });
      } catch {
        fail("data-error");
      }
    },
    [fetchNearby],
  );

  const initialize = useCallback(async () => {
    const cachedLocation = getCachedLocation();
    if (cachedLocation) {
      try {
        const places = await fetchNearby(cachedLocation.lat, cachedLocation.lng);
        if (mountedRef.current) setState({ status: "ready", places, refreshing: false });
        loadFresh(true);
        return;
      } catch {
        // 캐시된 위치로 조회 실패 — 아래에서 전체 재조회로 폴백
      }
    }
    loadFresh(false);
  }, [fetchNearby, loadFresh]);

  useEffect(() => {
    // mountedRef guards every setState call inside initialize/loadFresh against a race on unmount.
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retry = useCallback(() => loadFresh(false), [loadFresh]);

  return { ...state, retry };
}
