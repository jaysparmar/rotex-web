"use client";
import { useMemo, useState } from "react";
import { ResourceCard } from "@/components/ui/resource-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { matchesIndustryFilter, matchesProductFilter } from "@/lib/resource-filters";
import type { ResourceItem } from "@/lib/resource-types";
import type { ResolvedTag, IndustryOption } from "@/lib/resource-tags";

type ResourcesGridSectionProps = {
  heading: string;
  posts: ResourceItem[];
  basePath: string;
  products: ResolvedTag[];
  industries: IndustryOption[];
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
  options: { id: string; name: string }[];
}) {
  const selectedNames = options.filter((o) => selected.includes(o.id)).map((o) => o.name);
  const summary =
    selectedNames.length === 0 ? label : selectedNames.length === 1 ? selectedNames[0] : `${selectedNames.length} selected`;

  const toggle = (id: string, checked: boolean) =>
    onChange(checked ? [...selected, id] : selected.filter((o) => o !== id));

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
            key={opt.id}
            className="flex items-center gap-2.5 rounded-md px-2 py-2 hover:bg-stone-100 cursor-pointer"
          >
            <Checkbox
              checked={selected.includes(opt.id)}
              onCheckedChange={(c) => toggle(opt.id, c === true)}
            />
            <span className="text-sm font-medium font-montserrat text-stone-900">{opt.name}</span>
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}

/* Desktop multi-select filter for industries — top-level industries expand to show
   their sub-industries indented underneath. Checking a top-level industry rolls up
   to match resources tagged with any of its sub-industries too (matchesIndustryFilter). */
function IndustryMultiFilter({
  label,
  selected,
  onChange,
  industries,
}: {
  label: string;
  selected: string[];
  onChange: (next: string[]) => void;
  industries: IndustryOption[];
}) {
  const allNames = new Map<string, string>();
  industries.forEach((i) => {
    allNames.set(i.id, i.name);
    i.subIndustries.forEach((s) => allNames.set(s.id, s.name));
  });
  const selectedNames = selected.map((id) => allNames.get(id)).filter(Boolean) as string[];
  const summary =
    selectedNames.length === 0 ? label : selectedNames.length === 1 ? selectedNames[0] : `${selectedNames.length} selected`;

  const toggle = (id: string, checked: boolean) =>
    onChange(checked ? [...selected, id] : selected.filter((o) => o !== id));

  return (
    <Popover>
      <PopoverTrigger className={TRIGGER_CLS}>
        <span className="truncate">{summary}</span>
        <ChevronDown />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2 flex flex-col gap-0.5 max-h-96 overflow-y-auto">
        <label className="flex items-center gap-2.5 rounded-md px-2 py-2 hover:bg-stone-100 cursor-pointer">
          <Checkbox checked={selected.length === 0} onCheckedChange={() => onChange([])} />
          <span className="text-sm font-medium font-montserrat text-stone-900">{label}</span>
        </label>
        {industries.map((industry) => (
          <div key={industry.id}>
            <label className="flex items-center gap-2.5 rounded-md px-2 py-2 hover:bg-stone-100 cursor-pointer">
              <Checkbox
                checked={selected.includes(industry.id)}
                onCheckedChange={(c) => toggle(industry.id, c === true)}
              />
              <span className="text-sm font-medium font-montserrat text-stone-900">{industry.name}</span>
            </label>
            {industry.subIndustries.map((sub) => (
              <label
                key={sub.id}
                className="flex items-center gap-2.5 rounded-md px-2 py-2 pl-6 hover:bg-stone-100 cursor-pointer"
              >
                <Checkbox
                  checked={selected.includes(sub.id)}
                  onCheckedChange={(c) => toggle(sub.id, c === true)}
                />
                <span className="text-sm font-medium font-montserrat text-stone-500">{sub.name}</span>
              </label>
            ))}
          </div>
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
  products,
  industries,
}: {
  product: string[];
  setProduct: (v: string[]) => void;
  industry: string[];
  setIndustry: (v: string[]) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  products: ResolvedTag[];
  industries: IndustryOption[];
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
                {products.map((opt) => (
                  <FilterPill
                    key={opt.id}
                    label={opt.name}
                    active={product.includes(opt.id)}
                    onClick={() => toggle(product, setProduct, opt.id)}
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
                {industries.flatMap((ind) => [
                  <FilterPill
                    key={ind.id}
                    label={ind.name}
                    active={industry.includes(ind.id)}
                    onClick={() => toggle(industry, setIndustry, ind.id)}
                  />,
                  ...ind.subIndustries.map((sub) => (
                    <FilterPill
                      key={sub.id}
                      label={`— ${sub.name}`}
                      active={industry.includes(sub.id)}
                      onClick={() => toggle(industry, setIndustry, sub.id)}
                    />
                  )),
                ])}
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

export function ResourcesGridSection({ heading, posts, basePath, products, industries }: ResourcesGridSectionProps) {
  const [product, setProduct] = useState<string[]>([]);
  const [industry, setIndustry] = useState<string[]>([]);
  const [sort, setSort] = useState<"Newest" | "Oldest">("Newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const subIndustryParentMap = useMemo(() => {
    const map = new Map<string, string>();
    industries.forEach((ind) => ind.subIndustries.forEach((sub) => map.set(sub.id, ind.id)));
    return map;
  }, [industries]);

  const filteredPosts = useMemo(() => {
    // An empty selection means "all", so nothing is filtered out.
    let list = posts.filter(
      (p) =>
        (product.length === 0 || product.some((id) => matchesProductFilter(p.products.map((t) => t.id), id))) &&
        (industry.length === 0 ||
          industry.some((id) => matchesIndustryFilter(p.industries.map((t) => t.id), id, subIndustryParentMap)))
    );
    list = [...list].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sort === "Newest" ? -diff : diff;
    });
    return list;
  }, [posts, product, industry, sort, subIndustryParentMap]);

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
          products={products}
          industries={industries}
        />

        {/* Desktop filter row */}
        <div className="hidden lg:flex flex-wrap justify-end items-center gap-3">
          <MultiFilter label="All Products" selected={product} onChange={resetAndSet(setProduct)} options={products} />
          <IndustryMultiFilter
            label="All Industries"
            selected={industry}
            onChange={resetAndSet(setIndustry)}
            industries={industries}
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
