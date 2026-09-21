"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoSearchOutline } from "react-icons/io5";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ImageView } from "@/components/ui/image-view";
import type { SuggestedItem } from "@/lib/search-data";

// Sheet on mobile (slides up from the bottom), Dialog on desktop (centered) —
// two different interaction patterns by design, not one component reskinned,
// so each gets its native open/close animation instead of fighting the
// other's positioning CSS.
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

export function SearchModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const [term, setTerm] = useState("");
  const [products, setProducts] = useState<SuggestedItem[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const controller = new AbortController();
    debounceRef.current = setTimeout(() => {
      fetch(`/api/v1/search?q=${encodeURIComponent(term)}&mode=quick`, { signal: controller.signal })
        .then((res) => res.json())
        .then((json) => {
          if (!json.success) return;
          setProducts(json.data.products ?? []);
          setIndustries(json.data.industries ?? []);
        })
        .catch((err) => {
          if (err?.name !== "AbortError") {
            // swallow other errors as before
          }
        });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      controller.abort();
    };
  }, [term, open]);

  useEffect(() => {
    if (!open) setTerm("");
  }, [open]);

  const goToResults = () => {
    if (!term.trim()) return;
    onOpenChange(false);
    router.push(`/search?q=${encodeURIComponent(term.trim())}`);
  };

  const content = (
    <>
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-4">
        <IoSearchOutline size={18} className="text-neutral-400 shrink-0" />
        <input
          autoFocus
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && goToResults()}
          placeholder="Search products, industries, resources..."
          className="w-full bg-transparent text-stone-900 placeholder-neutral-400 text-sm font-montserrat outline-none"
        />
      </div>

      {products.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-neutral-400 text-xs font-semibold font-montserrat uppercase tracking-wide">
            Suggested Products
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {products.map((p) => (
              <Link
                key={p.slug}
                href={term.trim() ? `/products/${p.slug}` : `/products?category=${p.slug}`}
                onClick={() => onOpenChange(false)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-neutral-200 hover:border-[#EF3E23] transition-colors"
              >
                <div className="relative w-full h-32">
                  <ImageView src={p.image ?? "/file.svg"} alt={p.name} fill containerClassName="w-full h-full rounded-lg" className="object-contain" />
                </div>
                <span className="text-[#EF3E23] text-xs font-semibold font-montserrat text-center">{p.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {industries.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-neutral-400 text-xs font-semibold font-montserrat uppercase tracking-wide">
            Suggested Industries
          </span>
          <div className="flex flex-wrap gap-2">
            {industries.map((name) => (
              <span
                key={name}
                className="px-3 py-1.5 rounded-full border border-neutral-200 text-stone-900 text-xs font-semibold font-montserrat uppercase"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {term.trim() && products.length === 0 && industries.length === 0 && (
        <p className="text-neutral-400 text-sm font-montserrat text-center py-4">
          No matches yet — try &quot;View all results&quot; for the full search.
        </p>
      )}

      {term.trim() && (
        <button
          type="button"
          onClick={goToResults}
          className="self-center text-[#EF3E23] text-sm font-semibold font-montserrat hover:underline"
        >
          View all results
        </button>
      )}
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl sm:max-w-2xl max-h-[85vh] overflow-y-auto p-4 gap-5 sm:p-6 sm:gap-6" showCloseButton>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[85vh] w-full overflow-y-auto rounded-t-2xl p-4 gap-5"
        showCloseButton
      >
        <div className="mx-auto h-1 w-10 shrink-0 rounded-full bg-neutral-200" />
        {content}
      </SheetContent>
    </Sheet>
  );
}
