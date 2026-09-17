"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

/**
 * Shared URL-param plumbing for admin listing pages: pagination links, setting
 * a single filter param, and removing one or all filter params. Every admin
 * list is server-rendered from `searchParams`, so all of these just build a
 * new query string and push it — the server component re-queries on navigation.
 */
export function useAdminListUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function pageHref(nextPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    return `${pathname}?${params.toString()}`;
  }

  function setParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function removeParams(keys: string[]) {
    const params = new URLSearchParams(searchParams);
    for (const key of keys) params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll(keys: string[]) {
    removeParams(keys);
  }

  return { searchParams, pathname, router, pageHref, setParam, removeParams, clearAll };
}
