"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const SHOW_AFTER_PX = 400;

// Same right offset as WhatsApp (bottom-5/6) and Ask AI (bottom-24/28) —
// stacks in the next free slot above whichever of those are actually on,
// so it sits in the bottom corner when neither is present.
const SLOT_CLASSES = ["bottom-5 sm:bottom-6", "bottom-24 sm:bottom-28", "bottom-43 sm:bottom-50"];

export function BackToTopButton({
  hasWhatsApp,
  hasAskAi,
}: {
  hasWhatsApp: boolean;
  hasAskAi: boolean;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  const slot = (hasWhatsApp ? 1 : 0) + (hasAskAi ? 1 : 0);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`fixed right-5 z-40 flex size-14 items-center justify-center rounded-full bg-stone-900 text-white shadow-lg transition-transform hover:scale-105 sm:right-6 ${SLOT_CLASSES[slot]}`}
    >
      <ArrowUp className="size-6" />
    </button>
  );
}
