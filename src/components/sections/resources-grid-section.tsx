"use client";
import { useMemo, useState } from "react";
import { ResourceCard } from "@/components/ui/resource-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import type { ResourceItem } from "@/lib/resource-types";

type ResourcesGridSectionProps = {
  heading: string;
  posts: ResourceItem[];
  basePath: string;
};

// 9 per page — Load More appends another 9.
const PAGE_SIZE = 9;
const ALL = "All";

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

/* Multi-select filter — an empty selection means "all". */
function MultiFilter({
  label,
  selected,
  onChange,
  options,
}: {
  label: string;
  selected: string[];
  onChange: (next: string[]) => void;
  options: string[];
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

export function ResourcesGridSection({ heading, posts, basePath }: ResourcesGridSectionProps) {
  const [product, setProduct] = useState<string[]>([]);
  const [industry, setIndustry] = useState<string[]>([]);
  const [sort, setSort] = useState<"Newest" | "Oldest">("Newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const products = useMemo(() => Array.from(new Set(posts.map((p) => p.product).filter(Boolean))), [posts]);
  const industries = useMemo(() => Array.from(new Set(posts.map((p) => p.industry).filter(Boolean))), [posts]);

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

  const resetAndSet =
    (setter: (v: string[]) => void) =>
    (v: string[]) => {
      setter(v);
      setVisibleCount(PAGE_SIZE);
    };

  return (
    <section className="py-12 lg:py-16">
      <div className="container flex flex-col gap-6">
        <h2 className="text-stone-900 text-2xl lg:text-3xl font-normal font-montserrat leading-8 lg:leading-10">
          {heading}
        </h2>

        {/* nowrap + horizontal scroll keeps the three filters on one line even if
            a label is long; lg re-enables wrapping and right-alignment */}
        <div className="flex flex-nowrap lg:flex-wrap justify-start lg:justify-end items-center gap-2 lg:gap-3 overflow-x-auto no-scrollbar lg:overflow-visible">
          <MultiFilter
            label="All Products"
            selected={product}
            onChange={resetAndSet(setProduct)}
            options={products}
          />
          <MultiFilter
            label="All Industries"
            selected={industry}
            onChange={resetAndSet(setIndustry)}
            options={industries}
          />
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
            className="w-full lg:w-auto px-6 py-3.5 bg-white rounded-[47px] shadow-[0px_13px_7.8px_-12px_rgba(0,0,0,0.25)] outline-[0.5px] -outline-offset-1 outline-[#EF3E23] text-[#EF3E23] text-sm font-bold font-montserrat uppercase leading-5 hover:bg-[#EF3E23] hover:text-white transition-colors duration-150 overflow-hidden"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}
