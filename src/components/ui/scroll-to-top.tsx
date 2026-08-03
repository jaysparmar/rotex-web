"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/*
  Next.js preserves scroll position across navigations that share a layout, so
  clicking a card from far down a page can land the visitor mid-article. Render
  this on pages that should always open at the top.
*/
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
