import { useCallback, useEffect, useRef, useState } from "react";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** 실제 API 호출(장소·점수 조회)의 로딩/에러/재시도를 다루는 공용 훅. */
export function useAsyncData<T>(loader: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const loaderRef = useRef(loader);

  useEffect(() => {
    loaderRef.current = loader;
  });

  const fetchOnce = useCallback(() => {
    loaderRef
      .current()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => {
        const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다";
        setState({ data: null, loading: false, error: message });
      });
  }, []);

  useEffect(() => {
    fetchOnce();
  }, [fetchOnce]);

  const retry = useCallback(() => {
    setState({ data: null, loading: true, error: null });
    fetchOnce();
  }, [fetchOnce]);

  return { ...state, retry };
}
