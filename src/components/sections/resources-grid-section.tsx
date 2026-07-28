"use client";
import { useMemo, useState } from "react";
import { ResourceCard } from "@/components/ui/resource-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ResourcePost } from "@/lib/resources-data";

type ResourcesGridSectionProps = {
  heading: string;
  posts: ResourcePost[];
  basePath: string;
};

const PAGE_SIZE = 3;
const ALL = "All";

function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? ALL)}>
      <SelectTrigger className="w-auto h-auto px-3 py-2 bg-stone-100 rounded-md border-0 gap-5 text-stone-900 text-sm font-medium font-montserrat">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{placeholder}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ResourcesGridSection({ heading, posts, basePath }: ResourcesGridSectionProps) {
  const [product, setProduct] = useState(ALL);
  const [industry, setIndustry] = useState(ALL);
  const [sort, setSort] = useState<"Newest" | "Oldest">("Newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const products = useMemo(() => Array.from(new Set(posts.map((p) => p.product))), [posts]);
  const industries = useMemo(() => Array.from(new Set(posts.map((p) => p.industry))), [posts]);

  const filteredPosts = useMemo(() => {
    let list = posts.filter(
      (p) => (product === ALL || p.product === product) && (industry === ALL || p.industry === industry)
    );
    list = [...list].sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sort === "Newest" ? -diff : diff;
    });
    return list;
  }, [posts, product, industry, sort]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const resetAndSet = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <section className="py-12 lg:py-16">
      <div className="container flex flex-col gap-6">
        <h2 className="text-stone-900 text-3xl font-normal font-montserrat leading-10">{heading}</h2>

        <div className="flex justify-end items-center gap-3">
          <FilterSelect value={product} onChange={resetAndSet(setProduct)} options={products} placeholder="All Product" />
          <FilterSelect value={industry} onChange={resetAndSet(setIndustry)} options={industries} placeholder="Industry" />
          <FilterSelect
            value={sort}
            onChange={(v) => setSort(v as "Newest" | "Oldest")}
            options={["Newest", "Oldest"]}
            placeholder="Sort"
          />
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
        <div className="w-full h-28 bg-white flex justify-center items-center">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="px-6 py-3.5 bg-white rounded-[47px] shadow-[0px_13px_7.8px_-12px_rgba(0,0,0,0.25)] outline-[0.5px] -outline-offset-1 outline-red-600 text-red-600 text-sm font-bold font-montserrat uppercase leading-5 hover:bg-red-600 hover:text-white transition-colors duration-150 overflow-hidden"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}
