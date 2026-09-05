import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { dbEvents } from "../data/events";

import type { StoreName } from "../data/events";

interface LiveQueryState<T> {
  data: T | undefined;
  error: Error | null;
  loading: boolean;
}

const LOADING: LiveQueryState<never> = {
  data: undefined,
  error: null,
  loading: true,
};

/**
 * Runs an async read and re-runs it whenever one of the given stores changes.
 * The previous `data` is kept while a store-change refresh is in flight so
 * lists don't flash; when `deps` change the result is a different query, so
 * the hook resets to `loading` (no stale record for the new key).
 */
export const useLiveQuery = <T>(
  query: () => Promise<T>,
  stores: StoreName[],
  deps: unknown[] = [],
): LiveQueryState<T> & { refresh: () => void } => {
  const [state, setState] = useState<LiveQueryState<T> & { key: object }>({
    ...LOADING,
    key: {},
  });
  const runId = useRef(0);
  const queryRef = useRef(query);
  queryRef.current = query;
  const storesKey = stores.join("|");
  // identity of the current (stores, deps) combination – results carry the
  // key they were fetched for, so a result for a previous key is never shown
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const queryKey = useMemo(() => ({}), [storesKey, ...deps]);

  const run = useCallback((key: object) => {
    const id = ++runId.current;
    queryRef
      .current()
      .then((data) => {
        if (id === runId.current) {
          setState({ data, error: null, loading: false, key });
        }
      })
      .catch((error: Error) => {
        if (id === runId.current) {
          setState((prev) =>
            prev.key === key
              ? { ...prev, error, loading: false }
              : { data: undefined, error, loading: false, key },
          );
        }
      });
  }, []);

  useEffect(() => {
    run(queryKey);
    const watched = new Set(storesKey.split("|") as StoreName[]);
    return dbEvents.subscribe((changed) => {
      for (const store of changed) {
        if (watched.has(store)) {
          run(queryKey);
          return;
        }
      }
    });
  }, [run, storesKey, queryKey]);

  const refresh = useCallback(() => run(queryKey), [run, queryKey]);

  // a result fetched for another key (deps changed) is stale: report loading
  const current = state.key === queryKey ? state : LOADING;
  return {
    data: current.data,
    error: current.error,
    loading: current.loading,
    refresh,
  };
};
