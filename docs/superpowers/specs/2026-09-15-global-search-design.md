# Global Search — Design

Date: 2026-09-15
Branch: `feature/global-search`

## Goal

Header search icon opens a modal (product/industry quick suggestions). Typing
+ "View all results" (or Enter) goes to a full `/search?q=` results page with
tabs: All / Products / Documents / Case Studies / Blogs / Jobs, each with a
live count, backed by one new search API.

## Data sources (existing schema, no migrations)

- Products: `Product` + `ProductVariant` — match `name`, `modelNumber`,
  `description`, `features`, `category.name`, `subCategory.name`,
  `industries.name`. Variants roll up to their parent product (dedup).
- Industries: `Industry` (+ `SubIndustry` for the modal's pill suggestions).
- Documents: flattened `Product.downloads` / `ProductVariant.downloads` JSON
  (same shape/pipeline as `/downloads` page, via `src/lib/downloads-data.ts`).
  Match `title`, `product`, `categoryName`.
  - **Product Certificate Type** filter = distinct `categoryName` values
    (backed by `DownloadCategory`).
  - **Quality Certificate Type** filter = derived from `tab`:
    `certificates` → Product Certificate Type bucket, `performance-certificates`
    → Quality Certificate Type bucket. No schema change; documented as a
    heuristic, revisit if client wants a real taxonomy later.
- Case Studies / Blogs: `Resource` (`type: "case-studies" | "blogs"`,
  `published: true`) — match `title`, `content`, `product`, `industry`.
- Jobs: `JobPosting` (`published: true`) — match `title`, `company`,
  `category`, `location`.

Match strategy: case-insensitive `contains` (SQLite `LIKE` is ASCII
case-insensitive by default — do **not** pass Prisma's `mode: "insensitive"`,
unsupported on SQLite and will throw).

## API

`GET /api/v1/search`

- `?q=<term>&mode=quick` — modal use. Returns:
  - `products`: top 4 matches (id, slug, name, image, category.name)
  - `industries`: union of matched products' industries; if `q` empty,
    falls back to `HomeSection("products")` curated categories + top
    industries, mirroring home page curation.
- `?q=<term>&tab=<all|products|documents|case-studies|blogs|jobs>&page=1&<filters>`
  — results page use. Returns `{ counts, items, meta }` for the active tab.
  Filters for `documents` tab: `product`, `productCertificateType`,
  `qualityCertificateType`, `industry`.

## Modal

Replaces the bare `<input>` stub in `src/components/layout/navbar.tsx`
(desktop + mobile trigger) with `src/components/layout/search-modal.tsx`:

- Debounced (300ms) fetch to `mode=quick`.
- Empty query: curated "Suggested Products" (home curation) + no industries
  row (matches empty-state screenshot).
- Typed query: matched products grid + "Suggested Industries" pill row +
  "View all results" link → `/search?q=<term>`. Enter key also navigates.

## Results page

`src/app/(site)/search/page.tsx` — server shell reads `searchParams.q`,
renders heading `Search results for '<q>'`, delegates to client component
`search-results-client.tsx` which:

- Fetches `?tab=all` once for counts + first-page "all" view (Products
  preview grid + Industries pill row + "View all products" links, matching
  screenshot).
- Tab bar shows live counts: `ALL RESULTS (n)`, `PRODUCTS (n)`, etc.
- Products tab: `ProductCard` grid, paginated.
- Documents tab: reuse/extend `downloads-filter-field.tsx` +
  `mobile-downloads-filters.tsx` (add the 2 new cert-type filters) and
  `DownloadCard`.
- Case Studies / Blogs tabs: reuse `ResourceCard` + `resources-grid-section.tsx`
  card layout.
- Jobs tab: extract the inline job-card markup from
  `career-open-positions-section.tsx` into a reusable `JobCard` (`src/components/ui/job-card.tsx`), used here and there.

## Testing

- Unit tests for `src/lib/search-data.ts` matching/dedup/filter-derivation
  functions.
- Manual browser pass: modal empty state, modal typed state, `/search` all
  tabs, filters, empty-results state, pagination.

## Out of scope

- Full-text ranking / typo tolerance (FTS5) — plain `contains` is enough at
  current catalog size.
- Real certificate-type taxonomy — using the tab-bucket heuristic above until
  client confirms actual categories.
