"use client";
import { useRef, useEffect, useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IoChevronForwardOutline, IoChevronBackOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { ProductListCard } from "@/components/ui/product-list-card";
import { FilterCombobox } from "@/components/ui/filter-combobox";
import { PageHero } from "@/components/ui/page-hero";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PRODUCT_ATTRIBUTES, type ProductAttributeKey } from "@/lib/product-constants";
import type { ProductSummary, CategoryWithCount, SubCategoryWithCount } from "@/lib/products-data";
import breadcrumbBg from "@/assets/Images/breadcurmbBackgrounds/default_bg.jpg";

// ── Sub-components ────────────────────────────────────────────────────────────

function TypePillGroup({
  subCategories,
  activeSlug,
  onChange,
}: {
  subCategories: SubCategoryWithCount[];
  activeSlug: string | null;
  onChange: (slug: string | null) => void;
}) {
  if (subCategories.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-stone-500 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide">
        Type
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onChange(null)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium font-montserrat leading-4 transition-colors duration-200",
            activeSlug === null
              ? "bg-zinc-800 text-white"
              : "ring-1 ring-inset ring-neutral-200 text-stone-900 hover:bg-stone-50"
          )}
        >
          All
        </button>
        {subCategories.map((s) => (
          <button
            key={s.id}
            onClick={() => onChange(s.slug)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium font-montserrat leading-4 transition-colors duration-200",
              activeSlug === s.slug
                ? "bg-zinc-800 text-white"
                : "ring-1 ring-inset ring-neutral-200 text-stone-900 hover:bg-stone-50"
            )}
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}

type FilterFieldsProps = {
  subCategories: SubCategoryWithCount[];
  activeSubCategorySlug: string | null;
  onSubCategoryChange: (slug: string | null) => void;
  attributeValues: Record<string, string[]>;
  activeFilters: Partial<Record<ProductAttributeKey, string>>;
  onFilterChange: (key: ProductAttributeKey, value: string | undefined) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
};

function FilterFields({
  subCategories,
  activeSubCategorySlug,
  onSubCategoryChange,
  attributeValues,
  activeFilters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}: FilterFieldsProps) {
  return (
    <>
      <TypePillGroup
        subCategories={subCategories}
        activeSlug={activeSubCategorySlug}
        onChange={onSubCategoryChange}
      />

      <div className="flex items-center justify-between">
        <p className="text-stone-500 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide">
          Filter by attribute
        </p>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs font-medium font-montserrat text-red-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {PRODUCT_ATTRIBUTES.map(({ key, label }) => {
        const options = attributeValues[key] ?? [];
        if (options.length === 0) return null;
        return (
          <FilterCombobox
            key={key}
            label={label}
            placeholder={`Select ${label}`}
            options={options}
            value={activeFilters[key] ? [activeFilters[key] as string] : []}
            onChange={(val) => onFilterChange(key, val[0])}
            multiple={false}
          />
        );
      })}
    </>
  );
}

function FilterSidebar(props: FilterFieldsProps) {
  return (
    <aside className="hidden lg:flex w-full lg:w-80 shrink-0 flex-col gap-7 pt-3">
      <FilterFields {...props} />
    </aside>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="w-full h-96 p-5 bg-white rounded-2xl outline outline-1 -outline-offset-1 outline-neutral-200 flex flex-col justify-between items-start animate-pulse">
      <div className="flex flex-col gap-5 items-start w-full">
        <div className="h-6 w-20 rounded-full bg-stone-200" />
        <div className="w-64 h-48 max-w-full rounded-lg bg-stone-200" />
      </div>
      <div className="self-stretch flex flex-col gap-1.5">
        <div className="h-4 w-16 rounded bg-stone-200" />
        <div className="h-5 w-3/4 rounded bg-stone-200" />
      </div>
    </div>
  );
}

function pageWindow(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("ellipsis");
    result.push(p);
  });
  return result;
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center lg:justify-end items-center gap-3 pt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="size-10 rounded-full flex items-center justify-center bg-stone-100 text-stone-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-200 transition-colors"
      >
        <IoChevronBackOutline size={16} />
      </button>

      {pageWindow(page, totalPages).map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e-${i}`} className="text-stone-400 text-sm font-medium font-montserrat">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "size-10 rounded-full flex items-center justify-center text-sm font-medium font-montserrat transition-colors",
              p === page
                ? "bg-red-600 text-white"
                : "outline outline-1 -outline-offset-1 outline-neutral-200 text-stone-500 hover:bg-stone-50"
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="size-10 rounded-full flex items-center justify-center bg-stone-100 text-stone-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-200 transition-colors"
      >
        <IoChevronForwardOutline size={16} />
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = { slug: string | null; name: string };

export function ProductsPageClient({
  products,
  categories,
  activeCategorySlug,
  subCategories,
  activeSubCategorySlug,
  attributeValues,
  activeFilters,
  page,
  totalPages,
}: {
  products: ProductSummary[];
  categories: CategoryWithCount[];
  activeCategorySlug: string | null;
  subCategories: SubCategoryWithCount[];
  activeSubCategorySlug: string | null;
  attributeValues: Record<string, string[]>;
  activeFilters: Partial<Record<ProductAttributeKey, string>>;
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const tabs: Tab[] = [{ slug: null, name: "All Products" }, ...categories.map((c) => ({ slug: c.slug, name: c.name }))];

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

  const navigate = (params: URLSearchParams) => {
    startTransition(() => {
      router.push(params.size ? `/products?${params.toString()}` : "/products", { scroll: false });
    });
  };

  const goToTab = (slug: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (slug) params.set("category", slug);
    else params.delete("category");
    params.delete("type");
    params.delete("page");
    navigate(params);
  };

  const handleSubCategoryChange = (slug: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (slug) params.set("type", slug);
    else params.delete("type");
    params.delete("page");
    navigate(params);
  };

  const handleFilterChange = (key: ProductAttributeKey, value: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    navigate(params);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams);
    for (const { key } of PRODUCT_ATTRIBUTES) params.delete(key);
    params.delete("type");
    params.delete("page");
    navigate(params);
  };

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams);
    if (nextPage > 1) params.set("page", String(nextPage));
    else params.delete("page");
    navigate(params);
  };

  const scrollTabs = (dir: "left" | "right") => {
    tabsRef.current?.scrollBy({ left: dir === "right" ? 200 : -200, behavior: "smooth" });
  };

  const hasActiveFilters =
    Boolean(activeSubCategorySlug) || PRODUCT_ATTRIBUTES.some(({ key }) => Boolean(activeFilters[key]));

  return (
    <div>
      <PageHero
        bg={breadcrumbBg}
        title="All Products"
        description="Precision on–off control engineered by Rotex for safety-critical and high-duty industrial environments."
      />

      <div className="container flex flex-col lg:flex-row gap-8 py-8 sm:py-12 items-start">
        {/* Sidebar (desktop) */}
        <FilterSidebar
          subCategories={subCategories}
          activeSubCategorySlug={activeSubCategorySlug}
          onSubCategoryChange={handleSubCategoryChange}
          attributeValues={attributeValues}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-6">

          {/* Filters trigger (mobile) */}
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden w-full px-5 py-3 bg-neutral-100 rounded-sm text-center text-stone-900 text-sm font-semibold font-montserrat leading-6"
          >
            Filters{hasActiveFilters ? " •" : ""}
          </button>

          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetContent side="bottom" className="lg:hidden max-h-[85vh] rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="flex-1 flex flex-col gap-7 overflow-y-auto px-4">
                <FilterFields
                  subCategories={subCategories}
                  activeSubCategorySlug={activeSubCategorySlug}
                  onSubCategoryChange={handleSubCategoryChange}
                  attributeValues={attributeValues}
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
              <SheetFooter>
                <Button type="button" onClick={() => setFiltersOpen(false)}>
                  Show Results
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/* Category tabs */}
          <div className="relative bg-white border-b border-stone-200 pt-3">
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
                    "shrink-0 px-2.5 py-4 sm:py-6 border-b-2 -mb-px text-base sm:text-lg font-semibold font-montserrat leading-5 whitespace-nowrap transition-colors duration-150",
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
          {isPending ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 relative z-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 relative z-0">
              {products.map((product) => (
                <ProductListCard key={product.slug} {...product} />
              ))}
            </div>
          ) : (
            <p className="text-stone-400 text-center py-20">No products found.</p>
          )}

          {!isPending && products.length > 0 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
          )}

        </div>
      </div>
    </div>
  );
}
