# SEO Settings (static pages) + dynamic favicon — Design

Date: 2026-09-15
Branch: `feature/global-search` (continues on this branch; unrelated to search feature but no new branch requested)

## Goal

Give admins a "SEO Settings" panel to edit meta title/description/keywords/OG
image/canonical/noindex/JSON-LD schema for each of the site's static pages,
and actually wire that data into `<head>` — today **no page** on the site
outputs per-page metadata; every page shares one static title/description
from `(site)/layout.tsx`, and a pre-existing `HomeSeo` admin editor
(`/admin/home/seo`) is dead code that nothing reads. Also: make the site
favicon admin-editable instead of the static `src/app/favicon.ico`.

Per-record SEO for dynamic pages (Product, Resource, Industry, etc.) is
explicitly **out of scope** for this pass — a deliberate follow-up phase.

## Data model

Replace `HomeSeo` (currently only source of "page SEO" data, unused by
rendering) with a generalized per-key model, following the exact shape
`HomeSection` already establishes for "one row per fixed page-key":

```prisma
model SeoPage {
  key       String   @id
  /// [SeoMetaData]
  data      Json
  updatedAt DateTime @updatedAt
}
```

```ts
// src/types/prisma-json.d.ts
type SeoMetaData = {
  title: string;
  description: string;
  keywords: string[];
  ogImage: { src: string; alt: string };
  canonical: string;
  noindex: boolean;
  schema: string; // raw JSON-LD text, validated as parseable JSON on save
};
```

Migration: create `SeoPage`, copy the existing `HomeSeo` row's `data`
(mapped into the new shape — `og_image`→`ogImage`, add empty
`keywords`/`schema`, `noindex: false`) into `SeoPage` at `key="home"`, then
drop the `HomeSeo` table and its Prisma model/admin route.

**16 fixed keys** (no create/delete — admins only ever edit an existing
key, rows self-heal via upsert-on-read so no seed script is required):

| key | public path |
|---|---|
| `home` | `/` |
| `products` | `/products` |
| `downloads` | `/downloads` |
| `blogs` | `/blogs` |
| `case-studies` | `/case-studies` |
| `news-updates` | `/news-updates` |
| `about` | `/about` |
| `about-awards` | `/about/awards` |
| `contact` | `/contact` |
| `join-career` | `/join/career` |
| `join-channel-partner` | `/join/channel-partner` |
| `join-partner-sales-tools` | `/join/partner-sales-tools` |
| `join-supplier` | `/join/supplier` |
| `privacy-policy` | `/privacy-policy` |
| `terms-and-conditions` | `/terms-and-conditions` |
| `search` | `/search` (defaults `noindex: true`) |

## Admin UI

- **`/admin/seo`** — list page. Static `SEO_PAGES` config array (key +
  label + public path), left-joined against `prisma.seoPage.findMany()` to
  show a "configured" / "not yet edited" badge per row. Not drag-sortable
  (unlike `HomeSection`'s list) — the page set is fixed. Each row links to
  `/admin/seo/[key]`.
- **`/admin/seo/[key]`** — one generic form (every key shares the same
  shape, unlike `HomeSection`'s per-key branching in `[key]/page.tsx`).
  Server component does
  `prisma.seoPage.upsert({ where: { key }, create: { key, data: DEFAULT }, update: {} })`
  so the page never 404s and no seed step is needed. Fields:
  - **Title** — `TextField` + live character counter, amber past 60,
    red past 70 (Google's approx. display cutoff), never blocks typing.
  - **Description** — `TextAreaField` + live counter, amber past 160, red
    past 180.
  - **Keywords** — repeater of text chips, reusing existing
    `RepeaterItem`/`AddButton` primitives (same pattern already used
    elsewhere in admin forms for string-array fields).
  - **OG Image** — `MediaPicker` (existing component) for `src`, text
    input for `alt`. This upgrades over the old `HomeSeo` form, which used
    a plain text URL field.
  - **Canonical URL** — `TextField`.
  - **Noindex** — `SwitchField`.
  - **Schema (JSON-LD)** — `TextAreaField`, larger (`rows={8}`), validated
    as parseable JSON on save (reject with an inline error if invalid,
    don't silently drop it).
  - Built on the existing `useForm` + `FormProvider` + `SaveBar` +
    `useSaveAction` pattern (matches every other singleton/section admin
    form in this codebase — see `home-sections/seo-form.tsx`). Server
    action `saveSeoPage(key, data)` in
    `src/app/admin/(dashboard)/seo/actions.ts`.
  - New reusable field components `TitleField`/`DescriptionField`
    (character-counter wrapper) live in
    `src/components/admin/seo/seo-meta-fields.tsx` — built once here,
    intended for reuse by the future dynamic-per-record SEO phase.
- **Nav:** new entry in `PAGE_ITEMS`
  (`src/components/admin/sidebar.tsx`): `{ href: "/admin/seo", label: "SEO Settings", icon: Search }`,
  alongside Home/About/Contact/etc.

## Public-side rendering (the actual gap this closes)

- `src/lib/seo.ts`:
  - `getPageSeo(key: string): Promise<SeoMetaData>` — fetch-or-default
    (same upsert-on-read as the admin edit page, so public rendering never
    breaks on an unconfigured page).
  - `buildMetadata(seo: SeoMetaData, fallback: { title: string; description: string }): Metadata`
    — maps to Next.js's `Metadata` shape: `title`, `description`,
    `keywords` (joined), `openGraph.images`, `alternates.canonical`,
    `robots.index/follow` from `noindex`. Falls back to the current
    site-wide title/description (from `(site)/layout.tsx`) for any empty
    field, so an unconfigured page never ships blank meta tags.
- Each of the 16 static `page.tsx` files gains:
  ```ts
  export async function generateMetadata(): Promise<Metadata> {
    return buildMetadata(await getPageSeo("<key>"), FALLBACK);
  }
  ```
  (dynamic route pages — `[slug]`, `[sector]`, etc. — are untouched, out of
  scope per the dynamic-SEO deferral above; `/search`'s `generateMetadata`
  additionally needs `searchParams` to keep composing its own dynamic title
  around the fixed SEO fallback — verify at implementation time whether
  that's still needed given `noindex` is on by default).
- `src/components/seo/seo-json-ld.tsx` — `<SeoJsonLd schema={string} />`,
  parses `schema` (skip render if empty/invalid — validation already
  happened at save time, but render-time is defensive) and outputs
  `<script type="application/ld+json" dangerouslySetInnerHTML={{__html: ...}} />`.
  Each static page renders this once, passing its fetched `seo.schema`.

## Favicon (small addendum, same GlobalConfig singleton)

- Add `favicon: string` to `PrismaJson.GlobalConfigData`, sibling to the
  existing `logo` field. No new model, no new admin route.
- Add a Favicon field (`MediaPicker`) to the existing `HeaderConfigForm`
  (`src/components/admin/home-sections/header-config-form.tsx`), same
  place `logo` is edited, on `/admin/global/header`.
- `(site)/layout.tsx` already calls `getResolvedGlobalConfig()` — wire
  `metadata.icons.icon` to `config.favicon`, falling back to the static
  `src/app/favicon.ico` when unset (Next.js's file-convention favicon
  keeps working as the zero-config default).

## Testing

No test framework exists in this repo (established convention) — manual
verification: `tsc --noEmit`, curl each of the 16 static routes and grep
the rendered `<head>` for `<title>`/`<meta name="description">` reflecting
admin-entered values, confirm `noindex` page renders
`<meta name="robots" content="noindex...">`, confirm invalid JSON-LD is
rejected on save with an inline form error, confirm favicon swap reflects
in `<link rel="icon">`.

## Out of scope

- Per-record dynamic SEO (Product/Resource/Industry/SubIndustry) — deferred
  follow-up phase, will reuse `TitleField`/`DescriptionField` from this
  pass.
- `sitemap.xml`/`robots.txt` — flagged earlier as a related gap, not
  requested for this pass; revisit separately if wanted.
- Structured, schema.org-type-specific form fields (Organization/WebPage
  builders) — raw JSON-LD textarea only, per approved decision.
