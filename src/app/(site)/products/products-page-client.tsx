"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IoChevronForwardOutline, IoChevronBackOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { ProductListCard } from "@/components/ui/product-list-card";
import { FilterCombobox } from "@/components/ui/filter-combobox";
import { PageHero } from "@/components/ui/page-hero";
import type { ProductSummary, CategoryWithCount } from "@/lib/products-data";
import breadcrumbBg from "@/assets/Images/breadcurmbBackgrounds/default_bg.jpg";

// ── Filter config ─────────────────────────────────────────────────────────────
// These pill/select filters are decorative placeholders (not wired to product
// attributes yet) — kept as-is from the original design pending a real filter
// pass over variant attributes (size, orifice, temp range, flow factor).

const FILTER_PILLS: { key: string; label: string; options: string[] }[] = [
  { key: "subType",       label: "Sub-type",      options: ["Standard", "Special", "Namur", "Pulse", "Gas", "Pneumatic", "Magnet"] },
  { key: "operatingType", label: "Operating Type", options: ["Direct Acting", "Pilot Operated", "External Pilot Operated", "Air Operated"] },
  { key: "actionType",    label: "Action Type",    options: ["Normally Close", "Normally Open", "Universal"] },
];

const FILTER_SELECTS: { key: string; label: string; placeholder: string; options: string[] }[] = [
  { key: "portSize",    label: "Port Size",          placeholder: "Select Port Size",         options: ['1/8"', '1/4"', '3/8"', '1/2"', '3/4"', '1"', '1-1/4"', '1-1/2"', '2"'] },
  { key: "minPressure", label: "Min Pressure (Bar)", placeholder: "Select Min. Pressure Bar", options: ["0", "0.5", "1", "2", "3", "5"] },
  { key: "maxPressure", label: "Max Pressure (Bar)", placeholder: "Select Max. Pressure Bar", options: ["5", "10", "16", "25", "40", "63"] },
  { key: "operatorSize",label: "Operator Size",      placeholder: "Select Operator Size",     options: ["DN15", "DN20", "DN25", "DN32", "DN40", "DN50", "DN65", "DN80"] },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterPill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-medium font-montserrat leading-4 transition-colors duration-200",
        selected
          ? "bg-zinc-800 text-white"
          : "ring-1 ring-inset ring-neutral-200 text-stone-900 hover:bg-stone-50"
      )}
    >
      {label}
    </button>
  );
}

function FilterSidebar({
  pillState,
  onPillToggle,
  selectState,
  onSelectChange,
}: {
  pillState: Record<string, string[]>;
  onPillToggle: (key: string, value: string) => void;
  selectState: Record<string, string[]>;
  onSelectChange: (key: string, value: string[]) => void;
}) {
  return (
    <aside className="w-80 shrink-0 flex flex-col gap-7 sticky top-24 self-start pt-3">
      {/* Pill filter groups */}
      {FILTER_PILLS.map(({ key, label, options }) => (
        <div key={key} className="flex flex-col gap-3">
          <p className="text-stone-500 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide">
            {label}
          </p>
          <div className="flex flex-wrap gap-3">
            {options.map((opt) => (
              <FilterPill
                key={opt}
                label={opt}
                selected={pillState[key]?.includes(opt) ?? false}
                onClick={() => onPillToggle(key, opt)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Combobox (searchable) filters */}
      {FILTER_SELECTS.map((s) => (
        <FilterCombobox
          key={s.key}
          label={s.label}
          placeholder={s.placeholder}
          options={s.options}
          value={selectState[s.key] ?? []}
          onChange={(val) => onSelectChange(s.key, val)}
        />
      ))}
    </aside>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = { slug: string | null; name: string };

export function ProductsPageClient({
  products,
  categories,
  activeCategorySlug,
}: {
  products: ProductSummary[];
  categories: CategoryWithCount[];
  activeCategorySlug: string | null;
}) {
  const router = useRouter();
  const tabs: Tab[] = [{ slug: null, name: "All Products" }, ...categories.map((c) => ({ slug: c.slug, name: c.name }))];

  const [pillState, setPillState] = useState<Record<string, string[]>>({
    subType: ["Standard"],
    operatingType: ["Direct Acting"],
    actionType: ["Normally Close"],
  });
  const [selectState, setSelectState] = useState<Record<string, string[]>>({
    portSize: [], minPressure: [], maxPressure: [], operatorSize: [],
  });
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = tabsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", updateScrollState); ro.disconnect(); };
  }, [updateScrollState]);

  const handlePillToggle = (key: string, value: string) => {
    setPillState((prev) => {
      const current = prev[key] ?? [];
      return {
        ...prev,
        [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      };
    });
  };

  const goToTab = (slug: string | null) => {
    router.push(slug ? `/products?category=${slug}` : "/products");
  };

  const scrollTabs = (dir: "left" | "right") => {
    tabsRef.current?.scrollBy({ left: dir === "right" ? 200 : -200, behavior: "smooth" });
  };

  return (
    <div>
      <PageHero
        bg={breadcrumbBg}
        title="All Products"
        description="Precision on–off control engineered by Rotex for safety-critical and high-duty industrial environments."
      />

      <div className="container flex gap-8 py-12 items-start">
        {/* Sidebar */}
        <FilterSidebar
          pillState={pillState}
          onPillToggle={handlePillToggle}
          selectState={selectState}
          onSelectChange={(key, val) => setSelectState((prev) => ({ ...prev, [key]: val } as Record<string, string[]>))}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">

          {/* Category tabs — sticky below navbar */}
          <div className="sticky top-24 z-30 bg-white border-b border-stone-200 pt-3">
            <div
              ref={tabsRef}
              className="no-scrollbar flex gap-5 overflow-x-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.slug ?? "all"}
                  onClick={() => goToTab(tab.slug)}
                  className={cn(
                    "shrink-0 px-2.5 py-6 border-b-2 -mb-px text-lg font-semibold font-montserrat leading-5 whitespace-nowrap transition-colors duration-150",
                    tab.slug === activeCategorySlug
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-stone-900 hover:text-red-600"
                  )}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Left fade + prev button */}
            {canScrollLeft && (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none" />
                <button
                  onClick={() => scrollTabs("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center text-stone-900 hover:text-red-600 transition-colors"
                  aria-label="Previous tabs"
                >
                  <IoChevronBackOutline size={18} />
                </button>
              </>
            )}

            {/* Right fade + next button */}
            {canScrollRight && (
              <>
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                <button
                  onClick={() => scrollTabs("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center text-stone-900 hover:text-red-600 transition-colors"
                  aria-label="Next tabs"
                >
                  <IoChevronForwardOutline size={18} />
                </button>
              </>
            )}
          </div>

          {/* Products grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-3 gap-5 relative z-0">
              {products.map((product) => (
                <ProductListCard key={product.slug} {...product} />
              ))}
            </div>
          ) : (
            <p className="text-stone-400 text-center py-20">No products found.</p>
          )}

        </div>
      </div>
    </div>
  );
}
