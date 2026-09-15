# Global Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Header search icon opens a real search modal (curated/matched products + industries), and a new `/search?q=` results page with tabs (All / Products / Documents / Case Studies / Blogs / Jobs), all backed by one new `GET /api/v1/search` API.

**Architecture:** Server-side Prisma helpers in `src/lib/search-data.ts` do case-insensitive `contains` matching per content type (reusing `getProductsList` for products, a refactored-out download-flattening helper for documents, direct Prisma queries for resources/jobs). One API route (`src/app/api/v1/search/route.ts`) exposes `mode=quick` (modal) and `tab=<x>` (results page) shapes. Two new client components (`search-modal.tsx`, `search-results-client.tsx`) consume it. Existing card/filter UI is reused wherever it already fits (`ProductListCard`, `DownloadCard`, `ResourceCard`) rather than rebuilt.

**Tech Stack:** Next.js App Router (server components + one `"use client"` results/modal pair), Prisma + SQLite, existing Tailwind/shadcn-style UI kit (`Select`, `Dialog`, `Sheet`, `Button`).

**Spec:** `docs/superpowers/specs/2026-09-15-global-search-design.md`

## Global Constraints

- SQLite backend: use plain Prisma `contains` for matching — **never** pass `mode: "insensitive"` (unsupported on SQLite, throws at runtime). SQLite `LIKE` is already ASCII case-insensitive.
- No test framework exists anywhere in this repo (`grep` for `*.test.ts*` and vitest/jest configs both come back empty). Do not add one for this feature. Verification is manual: `curl` against the running dev server for the API route, and a browser pass for the UI, per `superpowers:verification-before-completion`.
- Follow existing code conventions exactly: Tailwind classes inline (no CSS modules), `font-montserrat` on all text, `#EF3E23` as the brand red, `cn()` from `@/lib/utils` for conditional classes, Prisma helpers live in `src/lib/*-data.ts` or `src/lib/*.ts` (not inline in routes/pages).
- Reuse existing components instead of rebuilding: `ProductListCard` (`src/components/ui/product-list-card.tsx`), `DownloadCard` (`src/components/ui/download-card.tsx`), `DownloadsFilterField` (`src/components/ui/downloads-filter-field.tsx`), `ResourceCard` (`src/components/ui/resource-card.tsx`), `Dialog`/`DialogContent` (`src/components/ui/dialog.tsx`), `Pagination` (`src/components/ui/pagination.tsx`).
- Product Certificate Type filter = distinct `categoryName` among download items whose `tab === "certificates"`. Quality Certificate Type filter = distinct `categoryName` among items whose `tab === "performance-certificates"`. This is a heuristic (no dedicated schema field exists) — approved by the client-facing user for this pass.
- Search modal shows only Products (as Categories) + Industries — never documents/case-studies/blogs/jobs previews (matches the provided Figma screenshots).

---

### Task 1: Extract shared download-flattening helper

**Files:**
- Modify: `src/lib/downloads-data.ts`
- Modify: `src/app/(site)/downloads/page.tsx`

**Interfaces:**
- Produces: `flattenDownloadItems(input: { products: ProductForDownloads[]; variants: VariantForDownloads[]; downloadCategories: { id: string; name: string }[] }): DownloadItem[]` — exported from `src/lib/downloads-data.ts`. Later tasks (Task 3) import this instead of re-implementing the flatten logic.
- Produces: `fileTypeFromUrl(url: string): string` — moved here from `downloads/page.tsx` (was a private helper there), exported so Task 3 can reuse it.

The `/downloads` page currently inlines its own flatten logic (`fromProducts`/`fromVariants` + `fileTypeFromUrl`). The new search API needs the exact same flattening for the Documents tab. Extract it once so both call sites stay in sync.

- [ ] **Step 1: Add the shared types + helper to `src/lib/downloads-data.ts`**

Append to the end of the file (keep the existing `DownloadTab`/`DOWNLOAD_TABS`/`DownloadItem` exports untouched):

```ts
const PLACEHOLDER_IMAGE = "/file.svg";
const KNOWN_FILE_EXTENSIONS = new Set(["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "zip", "png", "jpg", "jpeg", "svg", "csv", "txt"]);

export function fileTypeFromUrl(url: string): string {
  const ext = url.split("?")[0].split("/").pop()?.split(".").pop()?.toLowerCase();
  return ext && KNOWN_FILE_EXTENSIONS.has(ext) ? ext.toUpperCase() : "";
}

export type ProductForDownloads = {
  id: string;
  name: string;
  image: string | null;
  downloads: unknown;
  modelNumber: string;
  category: { name: string } | null;
  subCategory: { name: string } | null;
  industries: { name: string }[];
};

export type VariantForDownloads = {
  id: string;
  downloads: unknown;
  industries: { name: string }[];
  product: {
    name: string;
    image: string | null;
    modelNumber: string;
    category: { name: string } | null;
    subCategory: { name: string } | null;
  };
};

type RawDownloadEntry = { title: string; url: string; tab?: string; categoryId: string };

export function flattenDownloadItems({
  products,
  variants,
  downloadCategories,
}: {
  products: ProductForDownloads[];
  variants: VariantForDownloads[];
  downloadCategories: { id: string; name: string }[];
}): DownloadItem[] {
  const categoryNameById = new Map(downloadCategories.map((c) => [c.id, c.name]));
  const defaultTab: DownloadTab = DOWNLOAD_TABS[0].id;

  const fromProducts: DownloadItem[] = products.flatMap((p) =>
    ((p.downloads as RawDownloadEntry[] | null) ?? [])
      .filter((d) => d.url)
      .map((d, i) => ({
        id: `product-${p.id}-${i}`,
        tab: (d.tab as DownloadTab) ?? defaultTab,
        title: d.title,
        language: "English",
        fileType: fileTypeFromUrl(d.url),
        fileSizeLabel: "",
        fileUrl: d.url,
        image: p.image ?? PLACEHOLDER_IMAGE,
        product: p.category?.name ?? "",
        subCategory: p.subCategory?.name ?? "",
        industries: p.industries.map((i) => i.name),
        categoryName: categoryNameById.get(d.categoryId) ?? "",
        modelNo: p.modelNumber ?? "",
      }))
  );

  const fromVariants: DownloadItem[] = variants.flatMap((v) =>
    ((v.downloads as RawDownloadEntry[] | null) ?? [])
      .filter((d) => d.url)
      .map((d, i) => ({
        id: `variant-${v.id}-${i}`,
        tab: (d.tab as DownloadTab) ?? defaultTab,
        title: d.title,
        language: "English",
        fileType: fileTypeFromUrl(d.url),
        fileSizeLabel: "",
        fileUrl: d.url,
        image: v.product.image ?? PLACEHOLDER_IMAGE,
        product: v.product.category?.name ?? "",
        subCategory: v.product.subCategory?.name ?? "",
        industries: v.industries.map((i) => i.name),
        categoryName: categoryNameById.get(d.categoryId) ?? "",
        modelNo: v.product.modelNumber ?? "",
      }))
  );

  return [...fromProducts, ...fromVariants];
}
```

- [ ] **Step 2: Rewrite `src/app/(site)/downloads/page.tsx` to use the shared helper**

Replace the whole file with:

```tsx
import { DownloadsHeroSection } from "@/components/sections/downloads-hero-section";
import { DownloadsSection } from "@/components/sections/downloads-section";
import { prisma } from "@/lib/prisma";
import { flattenDownloadItems } from "@/lib/downloads-data";

export default async function DownloadsPage() {
  const [products, variants, industries, downloadCategories] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        downloads: true,
        modelNumber: true,
        category: { select: { name: true } },
        subCategory: { select: { name: true } },
        industries: { select: { name: true } },
      },
    }),
    prisma.productVariant.findMany({
      select: {
        id: true,
        downloads: true,
        industries: { select: { name: true } },
        product: {
          select: {
            name: true,
            image: true,
            modelNumber: true,
            category: { select: { name: true } },
            subCategory: { select: { name: true } },
          },
        },
      },
    }),
    prisma.industry.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
    prisma.downloadCategory.findMany({ select: { id: true, name: true } }),
  ]);

  const items = flattenDownloadItems({ products, variants, downloadCategories });
  const industryOptions = industries.map((i) => i.name);

  return (
    <div>
      <DownloadsHeroSection />
      <DownloadsSection items={items} industryOptions={industryOptions} />
    </div>
  );
}
```

- [ ] **Step 3: Verify `/downloads` still works**

Run: `npm run dev` (if not already running), then `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5007/downloads` (adjust port if dev runs elsewhere; check `package.json` `dev` script/port).
Expected: `200`. Open the page in a browser and confirm the document grid + filters still render exactly as before (no visual change expected — this task is a pure refactor).

- [ ] **Step 4: Commit**

```bash
git add src/lib/downloads-data.ts "src/app/(site)/downloads/page.tsx"
git commit -m "refactor: extract shared download-flattening helper"
```

---

### Task 2: Generalize the mobile filter sheet to N categories

**Files:**
- Modify: `src/components/ui/mobile-downloads-filters.tsx`
- Modify: `src/components/sections/downloads-section.tsx`

**Interfaces:**
- Produces: `export type FilterCategoryConfig = { id: string; rowLabel: string; panelTitle: string; allLabel: string; placeholder: string; options: string[]; value: string; onChange: (v: string) => void }` and a generalized `MobileDownloadsFilters({ categories, hasActiveFilters, clearFilters }: { categories: FilterCategoryConfig[]; hasActiveFilters: boolean; clearFilters: () => void })`, exported from `src/components/ui/mobile-downloads-filters.tsx`. Task 7 (search Documents tab) passes 4 categories (Product, Product Certificate Type, Quality Certificate Type, Industry); the existing `/downloads` page keeps passing its 3.

The current component hardcodes exactly 3 categories (product/subCategory/industry) built from individual props. The search Documents tab needs 4 different categories (Product, Product Certificate Type, Quality Certificate Type, Industry). Generalize the component to take a `categories` array instead, and move the array-building up to each call site.

- [ ] **Step 1: Rewrite `src/components/ui/mobile-downloads-filters.tsx`**

```tsx
"use client";

import { useState } from "react";
import { ChevronLeft, Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const ALL = "All";

export type FilterCategoryConfig = {
  id: string;
  rowLabel: string;
  panelTitle: string;
  allLabel: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
};

export function MobileDownloadsFilters({
  categories,
  hasActiveFilters,
  clearFilters,
}: {
  categories: FilterCategoryConfig[];
  hasActiveFilters: boolean;
  clearFilters: () => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [panel, setPanel] = useState<string | null>(null);

  const activePanel = categories.find((c) => c.id === panel) ?? null;

  function selectValue(cat: FilterCategoryConfig, v: string) {
    cat.onChange(v);
    setPanel(null);
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setFiltersOpen(true)}
        className="w-full px-2 py-3 bg-neutral-100 rounded-sm flex justify-center items-center gap-2.5 text-stone-900 text-sm font-semibold font-montserrat leading-6"
      >
        Filters{hasActiveFilters ? " •" : ""}
      </button>

      {/* Main filters bottom sheet */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="flex-1 flex flex-col gap-5 overflow-y-auto px-4">
            {categories.map((cat) => (
              <div key={cat.id} className="flex flex-col gap-2">
                <span className="text-neutral-400 text-xs font-semibold font-montserrat uppercase leading-5">
                  {cat.rowLabel}
                </span>
                <button
                  type="button"
                  onClick={() => setPanel(cat.id)}
                  className="w-full px-3 py-2.5 bg-gray-50 rounded-lg border-0 outline-1 -outline-offset-1 outline-gray-200 text-left text-sm font-medium font-montserrat"
                >
                  <span className={cat.value === ALL ? "text-neutral-400" : "text-stone-900"}>
                    {cat.value === ALL ? cat.placeholder : cat.value}
                  </span>
                </button>
              </div>
            ))}
          </div>
          <SheetFooter className="flex-row items-center gap-4">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="shrink-0 text-[#EF3E23] text-xs font-semibold font-montserrat hover:underline"
              >
                Clear Filters
              </button>
            )}
            <Button type="button" onClick={() => setFiltersOpen(false)} className="flex-1">
              Show Results
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Per-field value picker bottom sheet, stacked above the filters sheet */}
      <Sheet open={activePanel !== null} onOpenChange={(next) => !next && setPanel(null)}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl">
          {activePanel && (
            <>
              <SheetHeader className="flex-row items-center gap-2 pr-9">
                <button type="button" onClick={() => setPanel(null)} className="text-[#EF3E23]">
                  <ChevronLeft className="size-4" />
                </button>
                <SheetTitle className="text-[#EF3E23]">{activePanel.panelTitle}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <button
                  type="button"
                  onClick={() => selectValue(activePanel, ALL)}
                  className="flex w-full items-center justify-between gap-3 border-b border-stone-100 py-3 text-left text-sm font-montserrat text-stone-900"
                >
                  {activePanel.allLabel}
                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded-sm border ${
                      activePanel.value === ALL ? "border-[#EF3E23] bg-[#EF3E23]" : "border-stone-300"
                    }`}
                  >
                    {activePanel.value === ALL && <Check className="size-3 text-white" />}
                  </span>
                </button>
                {activePanel.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => selectValue(activePanel, opt)}
                    className="flex w-full items-center justify-between gap-3 border-b border-stone-100 py-3 text-left text-sm font-montserrat text-stone-900"
                  >
                    {opt}
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center rounded-sm border ${
                        activePanel.value === opt ? "border-[#EF3E23] bg-[#EF3E23]" : "border-stone-300"
                      }`}
                    >
                      {activePanel.value === opt && <Check className="size-3 text-white" />}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
```

- [ ] **Step 2: Update `src/components/sections/downloads-section.tsx` call site**

Replace the import line:

```ts
import { MobileDownloadsFilters } from "@/components/ui/mobile-downloads-filters";
```

with:

```ts
import { MobileDownloadsFilters, type FilterCategoryConfig } from "@/components/ui/mobile-downloads-filters";
```

Replace the `<MobileDownloadsFilters ... />` usage block:

```tsx
        <MobileDownloadsFilters
          productOptions={productOptions}
          subCategoryOptions={subCategoryOptions}
          industryOptions={industryOptions}
          product={product}
          setProduct={setProduct}
          subCategory={subCategory}
          setSubCategory={setSubCategory}
          industry={industry}
          setIndustry={setIndustry}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
        />
```

with:

```tsx
        <MobileDownloadsFilters
          categories={
            [
              {
                id: "product",
                rowLabel: "Product",
                panelTitle: "Select Product",
                allLabel: "All Products",
                placeholder: "Select Product",
                options: productOptions,
                value: product,
                onChange: setProduct,
              },
              {
                id: "subCategory",
                rowLabel: "Sub Category Product",
                panelTitle: "Select Sub Category Product",
                allLabel: "All Sub Categories",
                placeholder: "Select Sub Category Product",
                options: subCategoryOptions,
                value: subCategory,
                onChange: setSubCategory,
              },
              {
                id: "industry",
                rowLabel: "Industry Type",
                panelTitle: "Select Industry",
                allLabel: "All Industries",
                placeholder: "Select Industry",
                options: industryOptions,
                value: industry,
                onChange: setIndustry,
              },
            ] satisfies FilterCategoryConfig[]
          }
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
        />
```

- [ ] **Step 3: Verify `/downloads` mobile filters still work**

Run the dev server, open `/downloads` in a mobile-width browser viewport, tap "Filters", confirm the 3 categories (Product / Sub Category Product / Industry Type) still list and apply correctly, same as before.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/mobile-downloads-filters.tsx src/components/sections/downloads-section.tsx
git commit -m "refactor: generalize mobile downloads filter sheet to N categories"
```

---

### Task 3: `src/lib/search-data.ts` — all search/matching logic

**Files:**
- Create: `src/lib/search-data.ts`

**Interfaces:**
- Consumes: `getProductsList` from `@/lib/products-data` (Task-independent, already exists — see `ProductListFilterParams`/`ProductListResult`/`ProductSummary`); `flattenDownloadItems`, `DownloadItem`, `DownloadTab` from `@/lib/downloads-data` (Task 1); `ResourceItem`, `ResourceType` from `@/lib/resource-types`; `prisma` from `@/lib/prisma`.
- Produces (consumed by Task 4's API route):
  - `type SuggestedCategory = { id: string; slug: string; name: string; image: string | null }`
  - `getModalSuggestions(q: string): Promise<{ products: SuggestedCategory[]; industries: string[] }>`
  - `type DocumentFilters = { product?: string; productCertificateType?: string; qualityCertificateType?: string; industry?: string }`
  - `type DocumentFilterOptions = { products: string[]; productCertificateTypes: string[]; qualityCertificateTypes: string[]; industries: string[] }`
  - `searchDocuments(q: string, filters: DocumentFilters, page: number, pageSize: number): Promise<{ items: DownloadItem[]; total: number; filterOptions: DocumentFilterOptions }>`
  - `type JobSummary = { id: string; company: string; title: string; category: string; location: string; tag: string; employmentType: string; workMode: string; aboutRole: string; whatYouDo: string[]; whatWeLookFor: string[]; whatYouGet: { icon: string; label: string }[] }`
  - `searchJobs(q: string, page: number, pageSize: number): Promise<{ items: JobSummary[]; total: number }>`
  - `searchResources(q: string, type: ResourceType, page: number, pageSize: number): Promise<{ items: ResourceItem[]; total: number }>`
  - `type SearchCounts = { products: number; documents: number; caseStudies: number; blogs: number; jobs: number; total: number }`
  - `getSearchCounts(q: string, documentFilters: DocumentFilters): Promise<SearchCounts>`

- [ ] **Step 1: Write `src/lib/search-data.ts`**

```ts
import { prisma } from "@/lib/prisma";
import { getProductsList } from "@/lib/products-data";
import { flattenDownloadItems, type DownloadItem } from "@/lib/downloads-data";
import type { ResourceItem, ResourceType } from "@/lib/resource-types";

// ─── Modal quick-suggestions (Products = Categories, Industries) ──────────────

export type SuggestedCategory = { id: string; slug: string; name: string; image: string | null };

async function curatedCategories(limit: number): Promise<SuggestedCategory[]> {
  const section = await prisma.homeSection.findUnique({ where: { key: "products" } });
  const categoryIds = ((section?.data as Record<string, unknown> | undefined)?.categoryIds as string[]) ?? [];
  if (categoryIds.length === 0) return [];
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, slug: true, name: true, image: true },
  });
  const byId = new Map(categories.map((c) => [c.id, c]));
  return categoryIds
    .map((id) => byId.get(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .slice(0, limit);
}

export async function getModalSuggestions(q: string): Promise<{ products: SuggestedCategory[]; industries: string[] }> {
  const query = q.trim();

  const products = query
    ? await prisma.category.findMany({
        where: { OR: [{ name: { contains: query } }, { description: { contains: query } }] },
        select: { id: true, slug: true, name: true, image: true },
        take: 4,
      })
    : await curatedCategories(4);

  const industryWhere = query
    ? {
        OR: [
          { name: { contains: query } },
          { products: { some: { name: { contains: query } } } },
          { products: { some: { modelNumber: { contains: query } } } },
        ],
      }
    : {};

  const industries = await prisma.industry.findMany({
    where: industryWhere,
    select: { name: true, subIndustries: { select: { name: true } } },
    take: 6,
  });

  const industryNames = Array.from(
    new Set(industries.flatMap((ind) => (ind.subIndustries.length > 0 ? ind.subIndustries.map((s) => s.name) : [ind.name])))
  ).slice(0, 6);

  return { products, industries: query ? industryNames : [] };
}

// ─── Documents (flattened Product/ProductVariant downloads) ───────────────────

export type DocumentFilters = {
  product?: string;
  productCertificateType?: string;
  qualityCertificateType?: string;
  industry?: string;
};

export type DocumentFilterOptions = {
  products: string[];
  productCertificateTypes: string[];
  qualityCertificateTypes: string[];
  industries: string[];
};

async function getAllDownloadItems(): Promise<DownloadItem[]> {
  const [products, variants, downloadCategories] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        downloads: true,
        modelNumber: true,
        category: { select: { name: true } },
        subCategory: { select: { name: true } },
        industries: { select: { name: true } },
      },
    }),
    prisma.productVariant.findMany({
      select: {
        id: true,
        downloads: true,
        industries: { select: { name: true } },
        product: {
          select: {
            name: true,
            image: true,
            modelNumber: true,
            category: { select: { name: true } },
            subCategory: { select: { name: true } },
          },
        },
      },
    }),
    prisma.downloadCategory.findMany({ select: { id: true, name: true } }),
  ]);

  return flattenDownloadItems({ products, variants, downloadCategories });
}

function matchesQuery(item: DownloadItem, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    item.title.toLowerCase().includes(q) ||
    item.modelNo.toLowerCase().includes(q) ||
    item.product.toLowerCase().includes(q)
  );
}

export async function searchDocuments(
  q: string,
  filters: DocumentFilters,
  page: number,
  pageSize: number
): Promise<{ items: DownloadItem[]; total: number; filterOptions: DocumentFilterOptions }> {
  const all = await getAllDownloadItems();
  const query = q.trim();

  const filterOptions: DocumentFilterOptions = {
    products: Array.from(new Set(all.map((i) => i.product).filter(Boolean))),
    productCertificateTypes: Array.from(
      new Set(all.filter((i) => i.tab === "certificates").map((i) => i.categoryName).filter(Boolean))
    ),
    qualityCertificateTypes: Array.from(
      new Set(all.filter((i) => i.tab === "performance-certificates").map((i) => i.categoryName).filter(Boolean))
    ),
    industries: Array.from(new Set(all.flatMap((i) => i.industries))),
  };

  const filtered = all.filter((item) => {
    if (!matchesQuery(item, query)) return false;
    if (filters.product && item.product !== filters.product) return false;
    if (filters.productCertificateType && !(item.tab === "certificates" && item.categoryName === filters.productCertificateType)) return false;
    if (filters.qualityCertificateType && !(item.tab === "performance-certificates" && item.categoryName === filters.qualityCertificateType)) return false;
    if (filters.industry && !item.industries.includes(filters.industry)) return false;
    return true;
  });

  const start = (Math.max(1, page) - 1) * pageSize;
  return { items: filtered.slice(start, start + pageSize), total: filtered.length, filterOptions };
}

// ─── Case studies / Blogs (Resource) ───────────────────────────────────────────

export async function searchResources(
  q: string,
  type: ResourceType,
  page: number,
  pageSize: number
): Promise<{ items: ResourceItem[]; total: number }> {
  const query = q.trim();
  const where = {
    type,
    published: true,
    ...(query
      ? {
          OR: [
            { title: { contains: query } },
            { content: { contains: query } },
            { product: { contains: query } },
            { industry: { contains: query } },
          ],
        }
      : {}),
  };

  const [records, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (Math.max(1, page) - 1) * pageSize,
      take: pageSize,
    }),
    prisma.resource.count({ where }),
  ]);

  const items: ResourceItem[] = records.map((r) => ({
    id: r.id,
    type: r.type,
    slug: r.slug,
    title: r.title,
    image: r.image,
    product: r.product,
    industry: r.industry,
    extraTags: (r.extraTags as string[]) ?? [],
    content: r.content,
    createdAt: r.createdAt.toISOString(),
  }));

  return { items, total };
}

// ─── Jobs (JobPosting) ──────────────────────────────────────────────────────────

export type JobSummary = {
  id: string;
  company: string;
  title: string;
  category: string;
  location: string;
  tag: string;
  employmentType: string;
  workMode: string;
  aboutRole: string;
  whatYouDo: string[];
  whatWeLookFor: string[];
  whatYouGet: { icon: string; label: string }[];
};

export async function searchJobs(
  q: string,
  page: number,
  pageSize: number
): Promise<{ items: JobSummary[]; total: number }> {
  const query = q.trim();
  const where = {
    published: true,
    ...(query
      ? {
          OR: [
            { title: { contains: query } },
            { company: { contains: query } },
            { category: { contains: query } },
            { location: { contains: query } },
          ],
        }
      : {}),
  };

  const [records, total] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (Math.max(1, page) - 1) * pageSize,
      take: pageSize,
    }),
    prisma.jobPosting.count({ where }),
  ]);

  const items: JobSummary[] = records.map((j) => ({
    id: j.id,
    company: j.company,
    title: j.title,
    category: j.category,
    location: j.location,
    tag: j.tag,
    employmentType: j.employmentType,
    workMode: j.workMode,
    aboutRole: j.aboutRole,
    whatYouDo: (j.whatYouDo as string[]) ?? [],
    whatWeLookFor: (j.whatWeLookFor as string[]) ?? [],
    whatYouGet: (j.whatYouGet as { icon: string; label: string }[]) ?? [],
  }));

  return { items, total };
}

// ─── Aggregate counts (for tab bar) ─────────────────────────────────────────────

export type SearchCounts = {
  products: number;
  documents: number;
  caseStudies: number;
  blogs: number;
  jobs: number;
  total: number;
};

export async function getSearchCounts(q: string, documentFilters: DocumentFilters): Promise<SearchCounts> {
  const [{ total: products }, { total: documents }, { total: caseStudies }, { total: blogs }, { total: jobs }] =
    await Promise.all([
      getProductsList({ search: q, page: 1, pageSize: 1 }),
      searchDocuments(q, documentFilters, 1, 1),
      searchResources(q, "case-studies", 1, 1),
      searchResources(q, "blogs", 1, 1),
      searchJobs(q, 1, 1),
    ]);

  return { products, documents, caseStudies, blogs, jobs, total: products + documents + caseStudies + blogs + jobs };
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit -p .` (or `npm run build` if no bare `tsc` script — check `package.json` first; use whichever the project already uses for type-checking).
Expected: no new errors from `src/lib/search-data.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/search-data.ts
git commit -m "feat: add search-data lib for global search matching"
```

---

### Task 4: `GET /api/v1/search` API route

**Files:**
- Create: `src/app/api/v1/search/route.ts`

**Interfaces:**
- Consumes: everything exported from `src/lib/search-data.ts` (Task 3), `getProductsList`/`ProductSummary` from `@/lib/products-data`, `apiSuccess`/`apiError` from `@/lib/api-response`.
- Produces (the wire contract Task 5 modal and Task 7 results page depend on):
  - `GET /api/v1/search?q=<term>&mode=quick` → `{ success: true, data: { products: SuggestedCategory[]; industries: string[] } }`
  - `GET /api/v1/search?q=<term>&tab=all&page=&product=&productCertificateType=&qualityCertificateType=&industry=` → `{ success: true, data: { counts: SearchCounts; productsPreview: ProductSummary[]; industries: string[] } }`
  - `GET ...&tab=products` → `{ success: true, data: { counts: SearchCounts; items: ProductSummary[]; total: number } }`
  - `GET ...&tab=documents` → `{ success: true, data: { counts: SearchCounts; items: DownloadItem[]; total: number; filterOptions: DocumentFilterOptions } }`
  - `GET ...&tab=case-studies|blogs` → `{ success: true, data: { counts: SearchCounts; items: ResourceItem[]; total: number } }`
  - `GET ...&tab=jobs` → `{ success: true, data: { counts: SearchCounts; items: JobSummary[]; total: number } }`
  - Missing/invalid `tab` → `apiError("INVALID_TAB", ..., 400)`.

- [ ] **Step 1: Write `src/app/api/v1/search/route.ts`**

```ts
import type { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getProductsList } from "@/lib/products-data";
import { prisma } from "@/lib/prisma";
import {
  getModalSuggestions,
  searchDocuments,
  searchResources,
  searchJobs,
  getSearchCounts,
  type DocumentFilters,
} from "@/lib/search-data";

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const mode = searchParams.get("mode");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  if (mode === "quick") {
    const suggestions = await getModalSuggestions(q);
    return apiSuccess(suggestions, new Date());
  }

  const documentFilters: DocumentFilters = {
    product: searchParams.get("product") ?? undefined,
    productCertificateType: searchParams.get("productCertificateType") ?? undefined,
    qualityCertificateType: searchParams.get("qualityCertificateType") ?? undefined,
    industry: searchParams.get("industry") ?? undefined,
  };

  const tab = searchParams.get("tab") ?? "all";
  const counts = await getSearchCounts(q, documentFilters);

  if (tab === "all") {
    const [{ products: productsPreview }, industries] = await Promise.all([
      getProductsList({ search: q, page: 1, pageSize: 4 }),
      prisma.industry.findMany({ where: q.trim() ? { name: { contains: q.trim() } } : {}, select: { name: true }, take: 6 }),
    ]);
    const industryNames = industries.length > 0 ? industries.map((i) => i.name) : (await prisma.industry.findMany({ select: { name: true }, take: 6 })).map((i) => i.name);
    return apiSuccess({ counts, productsPreview, industries: industryNames }, new Date());
  }

  if (tab === "products") {
    const { products, total } = await getProductsList({ search: q, page, pageSize: PAGE_SIZE });
    return apiSuccess({ counts, items: products, total }, new Date());
  }

  if (tab === "documents") {
    const { items, total, filterOptions } = await searchDocuments(q, documentFilters, page, PAGE_SIZE);
    return apiSuccess({ counts, items, total, filterOptions }, new Date());
  }

  if (tab === "case-studies" || tab === "blogs") {
    const { items, total } = await searchResources(q, tab, page, PAGE_SIZE);
    return apiSuccess({ counts, items, total }, new Date());
  }

  if (tab === "jobs") {
    const { items, total } = await searchJobs(q, page, PAGE_SIZE);
    return apiSuccess({ counts, items, total }, new Date());
  }

  return apiError("INVALID_TAB", `Unknown tab "${tab}"`, 400);
}
```

- [ ] **Step 2: Verify with curl against the running dev server**

Run:
```bash
npm run dev &
sleep 3
curl -s "http://localhost:5007/api/v1/search?q=valve&mode=quick" | head -c 500
echo
curl -s "http://localhost:5007/api/v1/search?q=valve&tab=all" | head -c 500
echo
curl -s "http://localhost:5007/api/v1/search?q=valve&tab=documents" | head -c 500
echo
curl -s "http://localhost:5007/api/v1/search?tab=bogus" | head -c 300
```
(Use the actual configured dev port from `package.json`'s `start`/`dev` script if different from 5007.)

Expected: first four calls return `{"success":true,...}` JSON with the shapes above; the last returns `{"success":false,"error":{"code":"INVALID_TAB",...}}`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/v1/search/route.ts
git commit -m "feat: add GET /api/v1/search API route"
```

---

### Task 5: Search modal — replace the navbar stub

**Files:**
- Create: `src/components/layout/search-modal.tsx`
- Modify: `src/components/layout/navbar.tsx`

**Interfaces:**
- Consumes: `GET /api/v1/search?q=&mode=quick` (Task 4) → `{ products: SuggestedCategory[]; industries: string[] }`; `Dialog`/`DialogContent` from `@/components/ui/dialog`; `ImageView` from `@/components/ui/image-view`.
- Produces: `SearchModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void })`, default export not used — named export, imported by `navbar.tsx`.

- [ ] **Step 1: Write `src/components/layout/search-modal.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoSearchOutline } from "react-icons/io5";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ImageView } from "@/components/ui/image-view";
import type { SuggestedCategory } from "@/lib/search-data";

export function SearchModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [products, setProducts] = useState<SuggestedCategory[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/v1/search?q=${encodeURIComponent(term)}&mode=quick`)
        .then((res) => res.json())
        .then((json) => {
          if (!json.success) return;
          setProducts(json.data.products ?? []);
          setIndustries(json.data.industries ?? []);
        })
        .catch(() => {});
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl sm:max-w-2xl p-6 gap-6" showCloseButton>
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
                  key={p.id}
                  href={`/products?category=${p.slug}`}
                  onClick={() => onOpenChange(false)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-neutral-200 hover:border-[#EF3E23] transition-colors"
                >
                  <div className="relative w-full h-20">
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

        {term.trim() && (
          <button
            type="button"
            onClick={goToResults}
            className="self-start text-[#EF3E23] text-sm font-semibold font-montserrat hover:underline"
          >
            View all results
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Wire it into `src/components/layout/navbar.tsx`**

Add the import (near the other `@/components/ui/*` imports, after the `SearchIcon` import):

```ts
import { SearchModal } from "@/components/layout/search-modal";
```

Replace the inline dropdown block:

```tsx
        {searchOpen && (
          <div
            className="container border-t border-white/10 py-3"
            style={{ background: "#161412" }}
          >
            <input
              autoFocus
              type="text"
              placeholder="Search products, industries, resources..."
              className="w-full bg-transparent text-white placeholder-stone-500 text-sm font-montserrat outline-none"
            />
          </div>
        )}
      </motion.header>
```

with:

```tsx
      </motion.header>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
```

(This moves the modal outside `<motion.header>` since `Dialog` already portals itself — it doesn't need to live inside the header's DOM subtree. The two existing `onClick={() => setSearchOpen((v) => !v)}` trigger buttons at the desktop/mobile `SearchIcon` locations need no changes — `open`/`onOpenChange` on `Dialog` already handles toggling correctly from the same boolean state.)

- [ ] **Step 3: Manual browser verification**

Run dev server, open the site, click the header search icon. Confirm: modal opens centered with dark overlay, empty state shows curated "Suggested Products" tiles (or nothing if no `HomeSection("products")` curation exists in dev data — check via `/api/v1/home/products`), typing a query (e.g. a real product name from the seed data) updates suggestions after ~300ms, pressing Enter or "View all results" navigates to `/search?q=...`, the X close button and clicking the overlay both close it.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/search-modal.tsx src/components/layout/navbar.tsx
git commit -m "feat: add global search modal to header"
```

---

### Task 6: Extract `JobCard`

**Files:**
- Create: `src/components/ui/job-card.tsx`
- Modify: `src/components/sections/career-open-positions-section.tsx`

**Interfaces:**
- Produces: `export type JobCardJob = { id: string; company: string; title: string; category: string; location: string; tag: string; employmentType: string; workMode: string; aboutRole: string; whatYouDo: string[]; whatWeLookFor: string[]; whatYouGet: { icon: string; label: string }[] }` and `JobCard({ job, experienceOptions, positionOptions }: { job: JobCardJob; experienceOptions?: string[]; positionOptions?: string[] })`, exported from `src/components/ui/job-card.tsx`. Task 7's Jobs tab imports `JobCard` directly (the type matches `JobSummary` from Task 3's `search-data.ts` field-for-field).

- [ ] **Step 1: Write `src/components/ui/job-card.tsx`**

```tsx
import { MapPin } from "lucide-react";
import { RotexArrow } from "@/components/ui/rotex-arrow";
import { JobDetailSheet } from "@/components/sections/job-detail-sheet";

export type JobCardJob = {
  id: string;
  company: string;
  title: string;
  category: string;
  location: string;
  tag: string;
  employmentType: string;
  workMode: string;
  aboutRole: string;
  whatYouDo: string[];
  whatWeLookFor: string[];
  whatYouGet: { icon: string; label: string }[];
};

export function JobCard({
  job,
  experienceOptions,
  positionOptions,
}: {
  job: JobCardJob;
  experienceOptions?: string[];
  positionOptions?: string[];
}) {
  return (
    <div className="bg-white rounded-xl border-l-4 border-transparent hover:border-[#EF3E23] transition-colors duration-300 p-6 flex flex-col gap-3">
      <p className="text-zinc-800 font-montserrat font-medium text-sm leading-5">{job.company}</p>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-stone-500 font-montserrat font-semibold text-lg leading-6">{job.title}</h3>
            <span className="px-2 py-1 rounded-lg bg-red-50 text-[#EF3E23] text-xs font-medium font-montserrat leading-4">
              {job.category}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="size-4 text-neutral-400" strokeWidth={1.5} />
            <span className="text-neutral-400 font-montserrat font-medium text-sm leading-5">{job.location}</span>
          </div>
        </div>

        <JobDetailSheet
          job={job}
          experienceOptions={experienceOptions}
          positionOptions={positionOptions}
          trigger={
            <button
              type="button"
              className="inline-flex w-fit shrink-0 items-center gap-2.5 pl-4 pr-2.5 py-2 rounded-[45px] bg-white outline outline-1 -outline-offset-1 outline-[#EF3E23] text-[#EF3E23] font-montserrat font-medium text-sm leading-6 hover:bg-red-50 transition-colors"
            >
              View Details
              <RotexArrow size={7} />
            </button>
          }
        />
      </div>

      {job.tag && (
        <span className="w-fit px-1.5 py-1 bg-neutral-100 text-neutral-400 font-montserrat font-medium text-sm leading-5">
          {job.tag}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update `src/components/sections/career-open-positions-section.tsx` to use it**

Replace the import block at the top (remove `MapPin`, `RotexArrow`, `JobDetailSheet` imports since `JobCard` now owns them; add the `JobCard` import):

```ts
"use client";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobCard } from "@/components/ui/job-card";
import { cn } from "@/lib/utils";
```

Replace the `Job` type with an import of `JobCardJob` (re-exported as `Job` for this file's own readability):

```ts
import type { JobCardJob as Job } from "@/components/ui/job-card";
```

(place this import line alongside the others above)

Replace the rendered list body:

```tsx
        <div className="flex flex-col gap-5">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl border-l-4 border-transparent hover:border-[#EF3E23] transition-colors duration-300 p-6 flex flex-col gap-3">
                <p className="text-zinc-800 font-montserrat font-medium text-sm leading-5">{job.company}</p>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-stone-500 font-montserrat font-semibold text-lg leading-6">{job.title}</h3>
                      <span className="px-2 py-1 rounded-lg bg-red-50 text-[#EF3E23] text-xs font-medium font-montserrat leading-4">
                        {job.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-4 text-neutral-400" strokeWidth={1.5} />
                      <span className="text-neutral-400 font-montserrat font-medium text-sm leading-5">{job.location}</span>
                    </div>
                  </div>

                  <JobDetailSheet
                    job={job}
                    experienceOptions={experienceOptions}
                    positionOptions={positionOptions}
                    trigger={
                      <button
                        type="button"
                        className="inline-flex w-fit shrink-0 items-center gap-2.5 pl-4 pr-2.5 py-2 rounded-[45px] bg-white outline outline-1 -outline-offset-1 outline-[#EF3E23] text-[#EF3E23] font-montserrat font-medium text-sm leading-6 hover:bg-red-50 transition-colors"
                      >
                        View Details
                        <RotexArrow size={7} />
                      </button>
                    }
                  />
                </div>

                {job.tag && (
                  <span className="w-fit px-1.5 py-1 bg-neutral-100 text-neutral-400 font-montserrat font-medium text-sm leading-5">
                    {job.tag}
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-stone-400 py-14">No open positions match this filter right now.</p>
          )}
        </div>
```

with:

```tsx
        <div className="flex flex-col gap-5">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} experienceOptions={experienceOptions} positionOptions={positionOptions} />
            ))
          ) : (
            <p className="text-center text-stone-400 py-14">No open positions match this filter right now.</p>
          )}
        </div>
```

- [ ] **Step 3: Verify `/join/career` still renders correctly**

Run dev server, open the careers page, confirm the open-positions list looks pixel-identical to before and "View Details" still opens the job detail sheet.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/job-card.tsx src/components/sections/career-open-positions-section.tsx
git commit -m "refactor: extract reusable JobCard component"
```

---

### Task 7: `/search` results page

**Files:**
- Create: `src/app/(site)/search/page.tsx`
- Create: `src/app/(site)/search/search-results-client.tsx`
- Create: `src/components/ui/search-documents-panel.tsx`

**Interfaces:**
- Consumes: `GET /api/v1/search` (Task 4) in all its tab shapes; `ProductListCard` (`@/components/ui/product-list-card`); `DownloadCard`, `DownloadsFilterField` (`@/components/ui/download-card`, `@/components/ui/downloads-filter-field`); `MobileDownloadsFilters`/`FilterCategoryConfig` (Task 2); `ResourceCard` (`@/components/ui/resource-card`); `JobCard` (Task 6); `Pagination` (`@/components/ui/pagination` — check its exact prop names by reading the file before using it, it's already imported elsewhere as `<Pagination page={page} totalPages={totalPages} onChange={setPage} />`).
- Produces: page route `/search?q=<term>`.

- [ ] **Step 1: Read `src/components/ui/pagination.tsx` to confirm its prop names**

Run: view the file (`page`, `totalPages`, `onChange` are used by `downloads-section.tsx` — confirm exact prop names/types before using it below; adjust the JSX in Step 3 if they differ).

- [ ] **Step 2: Write `src/components/ui/search-documents-panel.tsx`**

This is the Documents-tab filter+grid, extracted as its own component so `search-results-client.tsx` stays focused on tab switching.

```tsx
"use client";

import { useState } from "react";
import { DownloadCard } from "@/components/ui/download-card";
import { DownloadsFilterField } from "@/components/ui/downloads-filter-field";
import { MobileDownloadsFilters, type FilterCategoryConfig } from "@/components/ui/mobile-downloads-filters";
import { Pagination } from "@/components/ui/pagination";
import type { DownloadItem } from "@/lib/downloads-data";
import type { DocumentFilterOptions } from "@/lib/search-data";

const ALL = "All";

export function SearchDocumentsPanel({
  items,
  total,
  filterOptions,
  page,
  pageSize,
  onPageChange,
  filters,
  onFiltersChange,
}: {
  items: DownloadItem[];
  total: number;
  filterOptions: DocumentFilterOptions;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  filters: { product: string; productCertificateType: string; qualityCertificateType: string; industry: string };
  onFiltersChange: (next: typeof filters) => void;
}) {
  const [clearedFlash, setClearedFlash] = useState(false);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const set = (key: keyof typeof filters) => (value: string) =>
    onFiltersChange({ ...filters, [key]: value === ALL ? "" : value });

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const clearFilters = () => {
    onFiltersChange({ product: "", productCertificateType: "", qualityCertificateType: "", industry: "" });
    setClearedFlash(true);
    setTimeout(() => setClearedFlash(false), 300);
  };

  const categories: FilterCategoryConfig[] = [
    {
      id: "product",
      rowLabel: "Product",
      panelTitle: "Select Product",
      allLabel: "All Products",
      placeholder: "Select Product",
      options: filterOptions.products,
      value: filters.product || ALL,
      onChange: set("product"),
    },
    {
      id: "productCertificateType",
      rowLabel: "Product Certificate Type",
      panelTitle: "Select Product Certificate Type",
      allLabel: "All Types",
      placeholder: "Product Certificate Type",
      options: filterOptions.productCertificateTypes,
      value: filters.productCertificateType || ALL,
      onChange: set("productCertificateType"),
    },
    {
      id: "qualityCertificateType",
      rowLabel: "Quality Certificate Type",
      panelTitle: "Select Quality Certificate Type",
      allLabel: "All Types",
      placeholder: "Quality Certificate Type",
      options: filterOptions.qualityCertificateTypes,
      value: filters.qualityCertificateType || ALL,
      onChange: set("qualityCertificateType"),
    },
    {
      id: "industry",
      rowLabel: "Industry",
      panelTitle: "Select Industry",
      allLabel: "All Industries",
      placeholder: "Industry",
      options: filterOptions.industries,
      value: filters.industry || ALL,
      onChange: set("industry"),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="hidden lg:flex flex-wrap items-center gap-3">
        {categories.map((cat) => (
          <div key={cat.id} className="w-56">
            <DownloadsFilterField label={cat.rowLabel} placeholder={cat.placeholder} options={cat.options} value={cat.value} onChange={cat.onChange} />
          </div>
        ))}
        {hasActiveFilters && (
          <button type="button" onClick={clearFilters} className="text-[#EF3E23] text-xs font-semibold font-montserrat hover:underline">
            Clear All Filters
          </button>
        )}
      </div>

      <MobileDownloadsFilters categories={categories} hasActiveFilters={hasActiveFilters} clearFilters={clearFilters} />

      {items.length > 0 ? (
        <div className={clearedFlash ? "" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"}>
          {items.map((item) => (
            <DownloadCard key={item.id} item={item} showCategoryTag />
          ))}
        </div>
      ) : (
        <p className="text-stone-400 text-center py-20">No documents match your search.</p>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
    </div>
  );
}
```

- [ ] **Step 3: Write `src/app/(site)/search/search-results-client.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductListCard, type ProductListCardProps } from "@/components/ui/product-list-card";
import { ResourceCard } from "@/components/ui/resource-card";
import { JobCard } from "@/components/ui/job-card";
import { SearchDocumentsPanel } from "@/components/ui/search-documents-panel";
import { cn } from "@/lib/utils";
import type { DownloadItem } from "@/lib/downloads-data";
import type { SearchCounts, DocumentFilterOptions, JobSummary } from "@/lib/search-data";
import type { ResourceItem } from "@/lib/resource-types";

type Tab = "all" | "products" | "documents" | "case-studies" | "blogs" | "jobs";

const PAGE_SIZE = 12;
const DOC_PAGE_SIZE = 12;

type DocFilters = { product: string; productCertificateType: string; qualityCertificateType: string; industry: string };
const EMPTY_DOC_FILTERS: DocFilters = { product: "", productCertificateType: "", qualityCertificateType: "", industry: "" };

export function SearchResultsClient({ q }: { q: string }) {
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);
  const [docFilters, setDocFilters] = useState<DocFilters>(EMPTY_DOC_FILTERS);
  const [counts, setCounts] = useState<SearchCounts>({ products: 0, documents: 0, caseStudies: 0, blogs: 0, jobs: 0, total: 0 });

  const [allProductsPreview, setAllProductsPreview] = useState<ProductListCardProps[]>([]);
  const [allIndustries, setAllIndustries] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductListCardProps[]>([]);
  const [productsTotal, setProductsTotal] = useState(0);
  const [documents, setDocuments] = useState<DownloadItem[]>([]);
  const [documentsTotal, setDocumentsTotal] = useState(0);
  const [documentFilterOptions, setDocumentFilterOptions] = useState<DocumentFilterOptions>({
    products: [],
    productCertificateTypes: [],
    qualityCertificateTypes: [],
    industries: [],
  });
  const [caseStudies, setCaseStudies] = useState<ResourceItem[]>([]);
  const [caseStudiesTotal, setCaseStudiesTotal] = useState(0);
  const [blogs, setBlogs] = useState<ResourceItem[]>([]);
  const [blogsTotal, setBlogsTotal] = useState(0);
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [jobsTotal, setJobsTotal] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [tab, q]);

  useEffect(() => {
    const params = new URLSearchParams({ q, tab, page: String(page) });
    if (tab === "documents") {
      if (docFilters.product) params.set("product", docFilters.product);
      if (docFilters.productCertificateType) params.set("productCertificateType", docFilters.productCertificateType);
      if (docFilters.qualityCertificateType) params.set("qualityCertificateType", docFilters.qualityCertificateType);
      if (docFilters.industry) params.set("industry", docFilters.industry);
    }

    fetch(`/api/v1/search?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) return;
        const data = json.data;
        setCounts(data.counts);

        if (tab === "all") {
          setAllProductsPreview(data.productsPreview);
          setAllIndustries(data.industries);
        } else if (tab === "products") {
          setProducts(data.items);
          setProductsTotal(data.total);
        } else if (tab === "documents") {
          setDocuments(data.items);
          setDocumentsTotal(data.total);
          setDocumentFilterOptions(data.filterOptions);
        } else if (tab === "case-studies") {
          setCaseStudies(data.items);
          setCaseStudiesTotal(data.total);
        } else if (tab === "blogs") {
          setBlogs(data.items);
          setBlogsTotal(data.total);
        } else if (tab === "jobs") {
          setJobs(data.items);
          setJobsTotal(data.total);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, q, page, docFilters]);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "all", label: "All Results", count: counts.total },
    { id: "products", label: "Products", count: counts.products },
    { id: "documents", label: "Documents", count: counts.documents },
    { id: "case-studies", label: "Case Studies", count: counts.caseStudies },
    { id: "blogs", label: "Blogs", count: counts.blogs },
    { id: "jobs", label: "Jobs", count: counts.jobs },
  ];

  return (
    <div className="container py-10 flex flex-col gap-8">
      <h1 className="text-stone-900 font-montserrat font-medium text-3xl lg:text-5xl leading-tight">
        Search results for &apos;{q}&apos;
      </h1>

      <div className="border-b border-stone-300 flex items-center gap-5 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-2.5 py-5 border-b-2 whitespace-nowrap text-sm font-medium font-montserrat leading-5 transition-colors uppercase",
              t.id === tab ? "border-[#EF3E23] text-[#EF3E23]" : "border-transparent text-stone-900 hover:text-[#EF3E23]"
            )}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === "all" && (
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-stone-900 font-montserrat font-medium text-xl">Products ({counts.products})</h2>
              <button onClick={() => setTab("products")} className="text-[#EF3E23] text-sm font-semibold font-montserrat hover:underline">
                View All Products
              </button>
            </div>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
              {allProductsPreview.map((p) => (
                <ProductListCard key={p.slug} {...p} />
              ))}
            </div>
          </div>

          {allIndustries.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-stone-900 font-montserrat font-medium text-xl">Industries ({allIndustries.length})</h2>
              <div className="flex flex-wrap gap-3">
                {allIndustries.map((name) => (
                  <span key={name} className="px-4 py-2 rounded-full border border-neutral-200 text-stone-900 text-xs font-semibold font-montserrat uppercase">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "products" && (
        <div className="flex flex-col gap-5">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
              {products.map((p) => (
                <ProductListCard key={p.slug} {...p} />
              ))}
            </div>
          ) : (
            <p className="text-stone-400 text-center py-20">No products match your search.</p>
          )}
          <PaginationRow page={page} total={productsTotal} pageSize={PAGE_SIZE} onChange={setPage} />
        </div>
      )}

      {tab === "documents" && (
        <SearchDocumentsPanel
          items={documents}
          total={documentsTotal}
          filterOptions={documentFilterOptions}
          page={page}
          pageSize={DOC_PAGE_SIZE}
          onPageChange={setPage}
          filters={docFilters}
          onFiltersChange={setDocFilters}
        />
      )}

      {(tab === "case-studies" || tab === "blogs") && (
        <div className="flex flex-col gap-5">
          {(tab === "case-studies" ? caseStudies : blogs).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {(tab === "case-studies" ? caseStudies : blogs).map((post) => (
                <ResourceCard key={post.id} post={post} basePath={`/${tab}`} />
              ))}
            </div>
          ) : (
            <p className="text-stone-400 text-center py-20">No results match your search.</p>
          )}
          <PaginationRow page={page} total={tab === "case-studies" ? caseStudiesTotal : blogsTotal} pageSize={PAGE_SIZE} onChange={setPage} />
        </div>
      )}

      {tab === "jobs" && (
        <div className="flex flex-col gap-5">
          {jobs.length > 0 ? (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <p className="text-stone-400 text-center py-20">No jobs match your search.</p>
          )}
          <PaginationRow page={page} total={jobsTotal} pageSize={PAGE_SIZE} onChange={setPage} />
        </div>
      )}
    </div>
  );
}

function PaginationRow({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center gap-2 pt-4">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            "size-10 rounded-full flex items-center justify-center text-sm font-medium font-montserrat transition-colors",
            p === page ? "bg-[#EF3E23] text-white" : "outline outline-1 -outline-offset-1 outline-neutral-200 text-stone-500 hover:bg-stone-50"
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
```

Note: `ProductListCardProps` must be exported from `src/components/ui/product-list-card.tsx` — it already is (`export type ProductListCardProps = ...`), confirmed in Task-7 Step 1 read. `ProductSummary` from `@/lib/products-data` structurally matches `ProductListCardProps` (`slug, code, name, category, image, tags`) — the API returns `ProductSummary[]`, assign directly to the `ProductListCardProps[]` state, no mapping needed.

- [ ] **Step 4: Write `src/app/(site)/search/page.tsx`**

```tsx
import { SearchResultsClient } from "./search-results-client";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <SearchResultsClient q={q ?? ""} />;
}
```

- [ ] **Step 5: Manual browser verification**

Run the dev server, navigate to `/search?q=<a real product/keyword from your seed data>`. Confirm:
- Tab bar shows correct counts per type.
- "All Results" tab shows a 4-card products preview + "View All Products" link (switches to Products tab) + an industries pill row.
- "Products" tab paginates correctly using `ProductListCard`.
- "Documents" tab shows the 4 filter dropdowns (desktop) / filter sheet (mobile), and selecting a Product Certificate Type or Quality Certificate Type value actually narrows results.
- "Case Studies" / "Blogs" tabs render `ResourceCard` grids and link to the right detail pages.
- "Jobs" tab renders `JobCard`s and "View Details" opens the existing job detail sheet.
- Searching a term with zero matches in a tab shows the tab's empty state, not a crash.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(site)/search" src/components/ui/search-documents-panel.tsx
git commit -m "feat: add /search results page with tabs for all content types"
```

---

### Task 8: Final end-to-end verification

**Files:** none (verification only).

- [ ] **Step 1: Full manual pass per `superpowers:verification-before-completion`**

Run dev server. Walk the whole flow start to finish:
1. Click header search icon → modal opens.
2. Empty state shows curated Suggested Products (or gracefully shows nothing if dev DB has no `HomeSection("products")` curation — check `/api/v1/home/products` response to know which to expect).
3. Type a real term from seed data → suggestions update, industries pills appear.
4. Press Enter → lands on `/search?q=<term>` with correct heading.
5. Click through all 6 tabs, confirm counts match what "All Results" implies and each tab's content/filters/pagination work.
6. Confirm `/downloads`, `/products`, `/blogs`, `/case-studies`, `/join/career` pages (touched indirectly by Tasks 1/2/6) still work exactly as before — no regressions.

- [ ] **Step 2: Report status**

Summarize what was verified and any known gaps (e.g. multi-select certificate-type filters, contextual placeholder text from the Figma, FTS ranking) as deliberate out-of-scope items per the spec's "Out of scope" section — not left silently broken.
