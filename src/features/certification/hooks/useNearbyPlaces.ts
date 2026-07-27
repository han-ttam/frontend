import { useCallback, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";

import { getNearbyPlaces } from "../index";
import { rankNearbyPlaces } from "../ranking";
import { getCachedLocation, setCachedLocation } from "../locationCache";
import type { NearbyPlace } from "../types";

const RADIUS_METERS = 2000;
const LIMIT = 20;

type Status = "loading" | "denied" | "error" | "ready";

interface NearbyState {
  status: Status;
  places: NearbyPlace[];
  refreshing: boolean;
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

  const fetchRanked = useCallback(async (lat: number, lng: number) => {
    const places = await getNearbyPlaces({ lat, lng, radius: RADIUS_METERS, limit: LIMIT });
    return rankNearbyPlaces(places, RADIUS_METERS);
  }, []);

  const loadFresh = useCallback(
    async (background: boolean) => {
      if (background) {
        setState((s) => ({ ...s, refreshing: true }));
      } else {
        setState({ status: "loading", places: [], refreshing: false });
      }

      try {
        const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
        if (permStatus !== "granted") {
          if (mountedRef.current) setState({ status: "denied", places: [], refreshing: false });
          return;
        }

        const position = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = position.coords;
        setCachedLocation(latitude, longitude);
        const ranked = await fetchRanked(latitude, longitude);
        if (mountedRef.current) setState({ status: "ready", places: ranked, refreshing: false });
      } catch {
        if (!mountedRef.current) return;
        setState((s) =>
          background ? { ...s, refreshing: false } : { status: "error", places: [], refreshing: false },
        );
      }
    },
    [fetchRanked],
  );

  const initialize = useCallback(async () => {
    const cachedLocation = getCachedLocation();
    if (cachedLocation) {
      try {
        const ranked = await fetchRanked(cachedLocation.lat, cachedLocation.lng);
        if (mountedRef.current) setState({ status: "ready", places: ranked, refreshing: false });
        loadFresh(true);
        return;
      } catch {
        // 캐시된 위치로 조회 실패 — 아래에서 전체 재조회로 폴백
      }
    }
    loadFresh(false);
  }, [fetchRanked, loadFresh]);

  useEffect(() => {
    // mountedRef guards every setState call inside initialize/loadFresh against a race on unmount.
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retry = useCallback(() => loadFresh(false), [loadFresh]);

  return { ...state, retry };
}
