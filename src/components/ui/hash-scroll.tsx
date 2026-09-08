"use client";

import { useEffect } from "react";

/**
 * On a fresh load/reload with a #hash in the URL, the browser jumps to the
 * target instantly (often before layout/images settle, landing in the wrong
 * spot). This waits for the page to finish loading, then re-does the jump
 * as a smooth scroll to the actual element.
 */
export function HashScroll() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const scrollToHash = () => {
      const id = decodeURIComponent(hash.slice(1));
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    if (document.readyState === "complete") {
      const t = setTimeout(scrollToHash, 300);
      return () => clearTimeout(t);
    }

    const onLoad = () => setTimeout(scrollToHash, 300);
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
