# Route CMS Status

Snapshot of every public route in `src/app/(site)/`, whether it's driven by the
admin CMS or still hardcoded, and where to manage it. Last updated 2026-08-09.

## Done — CMS-connected

| Route | Admin location | Notes |
|---|---|---|
| `/` (Home) | Admin → Home Page | Pre-existing before this work; section-based (`HomeSection` model). |
| `/about` | Admin → Pages → About Page | 11 sections: Hero, Story (incl. video upload), Mission & Vision, Values, Journey, Trusted Countries, Zero Downtime CTA, Grow With Rotex, Achievements (picks featured Awards), Gallery (picks from Media Library), Resources. |
| `/about/awards` | Admin → Awards | Award records (CRUD) + embedded hero/enable-disable form on the same page. |
| `/contact` | Admin → Pages → Contact Page | 3 sections: Hero, Offices, Form. The form submits real enquiries into `Enquiry` (same store as `/admin/enquiries`), grouped by industry. |
| `/join/channel-partner` | Admin → Pages → Channel Partner Page | 7 sections: Hero, Stats, Why, Benefits (icon picker), Global Partner Map (shared Country picker), Stories, Form copy. Form fields are CMS-editable but don't submit yet (see below). |
| `/industries/[sector]`, `/industries/[sector]/[sub]` | Admin → Industries | Pre-existing. |
| `/products`, `/products/[slug]` | Admin → Products | Pre-existing. |

**Shared systems backing the above:** Partners, Countries (shared between About's
globe and Channel Partner's map), Media Library (global image/video upload +
picker), Customer Stories, Enquiries inbox.

## Not done — still static/hardcoded

| Route | What it actually does | Admin section |
|---|---|---|
| `/join/career` | Hardcoded `POSITIONS`/`EXPERIENCE`/`LOCATIONS` arrays; submit button is `disabled` — no backend at all. | None |
| `/join/supplier` | Same pattern — hardcoded options, `disabled` submit. | None |
| `/join/partner-sales-tools` | Client-only login gate (`useState`), no data fetching. | None |
| `/blogs`, `/blogs/[slug]` | Imports a static `RESOURCE_POSTS` array (`src/lib/resources-data.ts`). | **"Resources" exists at `/admin/resources` and writes to the real `Resource` model — but these pages don't read from it.** |
| `/case-studies`, `/case-studies/[slug]` | Same static `RESOURCE_POSTS`, shared detail component. | Same orphaned "Resources" admin. |
| `/news-updates`, `/news-updates/[slug]` | Same static data (+ a `FEATURED_NEWS` fallback). | Same orphaned "Resources" admin. |
| `/downloads` | Hardcoded `DOWNLOAD_ITEMS` + filter options (`src/lib/downloads-data.ts`), client-side filtering only. | None |

### ⚠️ Flag: the "Resources" admin section is orphaned

`/admin/resources` is real — it manages `Resource` rows (type: case-study /
news / blog), and About's "Resources" section already picks from it. But
`/blogs`, `/case-studies`, and `/news-updates` (list + detail pages) never
query that table — they all render the same hardcoded `RESOURCE_POSTS` array
instead, including their detail pages, which fall back to `post[0]` rather
than 404 when a CMS slug doesn't match. This is the single highest-value gap:
the data model and admin UI already exist, only the three public pages need
rewiring.

## Removed

| Route | Why |
|---|---|
| `/join` (bare index page) | Unused hub page — nothing linked to it, its three children (`career`, `channel-partner`, `supplier`) are reachable directly. Removed from code. |
| `/services` | Disconnected boilerplate (generic "Industrial Services" content, not Rotex-specific), not linked from nav/footer anywhere. Removed from code. |
