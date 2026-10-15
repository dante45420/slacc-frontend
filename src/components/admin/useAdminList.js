import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet } from "../../api/client";
import useAdminSession from "./useAdminSession";

/**
 * Loads an admin collection (GET path → array) with explicit loading and
 * error states. `reload()` refetches without blanking the current rows, so
 * the table doesn't flash after every mutation.
 */
export default function useAdminList(path, { sort } = {}) {
  const { handleAuthError } = useAdminSession();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const sortRef = useRef(sort);
  sortRef.current = sort;
  const requestId = useRef(0);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      const id = ++requestId.current;
      if (silent) setRefreshing(true);
      else setStatus("loading");
      try {
        const data = await apiGet(path);
        if (id !== requestId.current) return;
        if (!Array.isArray(data)) {
          throw new Error("");
        }
        const rows = sortRef.current ? [...data].sort(sortRef.current) : data;
        setItems(rows);
        setError(null);
        setStatus("ready");
      } catch (err) {
        if (id !== requestId.current) return;
        if (handleAuthError(err)) return;
        setError(err);
        setStatus("error");
      } finally {
        if (id === requestId.current) setRefreshing(false);
      }
    },
    [path, handleAuthError],
  );

  useEffect(() => {
    load();
    return () => {
      // Ignore responses that arrive after the tab unmounts.
      requestId.current += 1;
    };
  }, [load]);

  const reload = useCallback(() => load({ silent: true }), [load]);
  const retry = useCallback(() => load(), [load]);

  return { items, status, error, refreshing, reload, retry };
}
