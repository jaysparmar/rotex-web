"use client";
import { useMemo, useState } from "react";
import { ResourceCard } from "@/components/ui/resource-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RESOURCE_PRODUCT_CATEGORIES, RESOURCE_INDUSTRIES } from "@/lib/resource-taxonomy";
import type { ResourceItem } from "@/lib/resource-types";

type ResourcesGridSectionProps = {
  heading: string;
  posts: ResourceItem[];
  basePath: string;
};

// 15 per page — Load More appends another 15.
const PAGE_SIZE = 15;

/* Mobile: tight auto-width pills so all three fit one row at 375px.
   Desktop: wider fixed boxes. */
const TRIGGER_CLS =
  "shrink-0 w-auto lg:w-48 px-2.5 lg:px-3 py-2 lg:py-0 lg:h-11 flex items-center justify-between gap-1.5 lg:gap-2 bg-stone-100 rounded-md text-stone-900 text-xs lg:text-sm font-medium font-montserrat leading-5 whitespace-nowrap cursor-pointer";

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M2 4L6 8L10 4" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Desktop multi-select filter — an empty selection means "all". */
function MultiFilter({
  label,
  selected,
  onChange,
  options,
}: {
  label: string;
  selected: string[];
  onChange: (next: string[]) => void;
  options: readonly string[];
}) {
  const summary =
    selected.length === 0 ? label : selected.length === 1 ? selected[0] : `${selected.length} selected`;

  const toggle = (opt: string, checked: boolean) =>
    onChange(checked ? [...selected, opt] : selected.filter((o) => o !== opt));

  return (
    <Popover>
      <PopoverTrigger className={TRIGGER_CLS}>
        <span className="truncate">{summary}</span>
        <ChevronDown />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2 flex flex-col gap-0.5">
        <label className="flex items-center gap-2.5 rounded-md px-2 py-2 hover:bg-stone-100 cursor-pointer">
          <Checkbox checked={selected.length === 0} onCheckedChange={() => onChange([])} />
          <span className="text-sm font-medium font-montserrat text-stone-900">{label}</span>
        </label>
        {options.map((opt) => (
          <label
            key={opt}
            className="flex items-center gap-2.5 rounded-md px-2 py-2 hover:bg-stone-100 cursor-pointer"
          >
            <Checkbox
              checked={selected.includes(opt)}
              onCheckedChange={(c) => toggle(opt, c === true)}
            />
            <span className="text-sm font-medium font-montserrat text-stone-900">{opt}</span>
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function SortSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select
      items={[
        { value: "Newest", label: "Newest" },
        { value: "Oldest", label: "Oldest" },
      ]}
      value={value}
      onValueChange={(v) => onChange((v as string) ?? "Newest")}
    >
      <SelectTrigger className={`${TRIGGER_CLS} border-0`}>
        <SelectValue placeholder="Sort" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Newest">Newest</SelectItem>
        <SelectItem value="Oldest">Oldest</SelectItem>
      </SelectContent>
    </Select>
  );
}

/* Pill toggle used inside the mobile filter drawer. */
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium font-montserrat leading-5 border transition-colors",
        active
          ? "bg-red-50 border-[#EF3E23] text-[#EF3E23]"
          : "bg-white border-neutral-200 text-stone-900 hover:border-stone-400"
      )}
    >
      {label}
    </button>
  );
}

/* Mobile: single "Filters" button opening a bottom-sheet drawer with pill
   groups for Product and Industry — matches the Figma drawer exactly,
   instead of two separate small dropdown popovers. */
function MobileFilterDrawer({
  product,
  setProduct,
  industry,
  setIndustry,
  hasActiveFilters,
  clearFilters,
}: {
  product: string[];
  setProduct: (v: string[]) => void;
  industry: string[];
  setIndustry: (v: string[]) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (list: string[], setList: (v: string[]) => void, opt: string) =>
    setList(list.includes(opt) ? list.filter((o) => o !== opt) : [...list, opt]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full px-2 py-3 bg-neutral-100 rounded-sm flex justify-center items-center gap-2.5 text-stone-900 text-sm font-semibold font-montserrat leading-6"
      >
        Filters{hasActiveFilters ? " •" : ""}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto px-4">
            <div className="flex flex-col gap-3">
              <span className="text-neutral-400 text-xs font-semibold font-montserrat uppercase leading-5">
                Product
              </span>
              <div className="flex flex-wrap gap-2">
                <FilterPill label="All Products" active={product.length === 0} onClick={() => setProduct([])} />
                {RESOURCE_PRODUCT_CATEGORIES.map((opt) => (
                  <FilterPill
                    key={opt}
                    label={opt}
                    active={product.includes(opt)}
                    onClick={() => toggle(product, setProduct, opt)}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-neutral-400 text-xs font-semibold font-montserrat uppercase leading-5">
                Industry
              </span>
              <div className="flex flex-wrap gap-2">
                <FilterPill label="All Industries" active={industry.length === 0} onClick={() => setIndustry([])} />
                {RESOURCE_INDUSTRIES.map((opt) => (
                  <FilterPill
                    key={opt}
                    label={opt}
                    active={industry.includes(opt)}
                    onClick={() => toggle(industry, setIndustry, opt)}
                  />
                ))}
              </div>
            </div>
          </div>
          <SheetFooter className="flex-row items-center gap-4">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="shrink-0 text-[#EF3E23] text-xs font-semibold font-montserrat hover:underline"
              >
                Clear all
              </button>
            )}
            <Button type="button" onClick={() => setOpen(false)} className="flex-1">
              Show Results
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function ResourcesGridSection({ heading, posts, basePath }: ResourcesGridSectionProps) {
  const [product, setProduct] = useState<string[]>([]);
  const [industry, setIndustry] = useState<string[]>([]);
  const [sort, setSort] = useState<"Newest" | "Oldest">("Newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredPosts = useMemo(() => {
    // An empty selection means "all", so nothing is filtered out.
    let list = posts.filter(
      (p) =>
        (product.length === 0 || product.includes(p.product)) &&
        (industry.length === 0 || industry.includes(p.industry))
    );
    list = [...list].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sort === "Newest" ? -diff : diff;
    });
    return list;
  }, [posts, product, industry, sort]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;
  const hasActiveFilters = product.length > 0 || industry.length > 0;

  const resetAndSet =
    (setter: (v: string[]) => void) =>
    (v: string[]) => {
      setter(v);
      setVisibleCount(PAGE_SIZE);
    };

  const clearFilters = () => {
    setProduct([]);
    setIndustry([]);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <section className="py-12 lg:py-16">
      <div className="container flex flex-col gap-6">
        <h2 className="text-stone-900 text-2xl lg:text-3xl font-normal font-montserrat leading-8 lg:leading-10">
          {heading}
        </h2>

        <MobileFilterDrawer
          product={product}
          setProduct={resetAndSet(setProduct)}
          industry={industry}
          setIndustry={resetAndSet(setIndustry)}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
        />

        {/* Desktop filter row */}
        <div className="hidden lg:flex flex-wrap justify-end items-center gap-3">
          <MultiFilter
            label="All Products"
            selected={product}
            onChange={resetAndSet(setProduct)}
            options={RESOURCE_PRODUCT_CATEGORIES}
          />
          <MultiFilter
            label="All Industries"
            selected={industry}
            onChange={resetAndSet(setIndustry)}
            options={RESOURCE_INDUSTRIES}
          />
          <SortSelect value={sort} onChange={(v) => setSort(v as "Newest" | "Oldest")} />
        </div>

        {/* Mobile: sort still needs its own control since it's not in the drawer */}
        <div className="lg:hidden">
          <SortSelect value={sort} onChange={(v) => setSort(v as "Newest" | "Oldest")} />
        </div>

        {visiblePosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">
            {visiblePosts.map((post) => (
              <ResourceCard key={post.slug} post={post} basePath={basePath} />
            ))}
          </div>
        ) : (
          <p className="text-stone-400 text-center py-20">No results found.</p>
        )}

      </div>

      {hasMore && (
        <div className="container h-28 bg-white flex justify-center items-center">
          {/* full-width on mobile per Figma, content-width on desktop */}
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="w-full lg:w-auto px-6 py-3.5 bg-white rounded-[47px] outline-[0.5px] -outline-offset-1 outline-[#EF3E23] text-[#EF3E23] text-sm font-bold font-montserrat uppercase leading-5 hover:bg-[#EF3E23] hover:text-white transition-colors duration-150 overflow-hidden"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}
