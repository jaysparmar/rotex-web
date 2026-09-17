"use client";

import { useRef, useState } from "react";
import { useAdminListUrl } from "@/hooks/use-admin-list-url";

/**
 * Debounced free-text search box wired to a URL param. `q` is the current
 * value from the server (i.e. `searchParams.get(paramKey)`); local state only
 * exists so typing feels instant while the URL push is debounced.
 */
export function useDebouncedUrlSearch(q: string, paramKey = "q", delayMs = 350) {
  const { setParam } = useAdminListUrl();
  const [search, setSearch] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  if (q !== prevQ) {
    setPrevQ(q);
    setSearch(q);
  }

  function onSearchChange(value: string) {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setParam(paramKey, value || undefined);
    }, delayMs);
  }

  return { search, onSearchChange };
}
