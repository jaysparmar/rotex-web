# About Page CMS — Design

## Goal
Make every content section of the public `/about` page editable from the admin panel, following the exact pattern already used for the Home page CMS (`HomeSection` model, per-key API routes, per-key admin forms).

## Scope
- `/about` page only. `/about/awards` is out of scope.
- Fixed section order (no drag-to-reorder). Each section keeps an enable/disable toggle.
- Decorative SVGs, the interactive world map, and badge icon artwork stay hardcoded — not CMS fields.

## Sections and editable fields

| Key | Component | Editable fields |
|---|---|---|
| `hero` | AboutHeroSection | title, description, breadcrumb label, CTA label/href |
| `story` | AboutStorySection | heading, paragraphs[], stats[] (value/label), trustedLabel, logos (partner picker), videoSrc |
| `mission-vision` | MissionVisionSection | mission text, vision text |
| `values` | AboutValuesSection | heading, subheading, values[] (title/description) |
| `journey` | JourneyTimelineSection | heading, milestones[] (year/title/description) |
| `trusted-countries` | TrustedCountriesBanner | title, description |
| `zero-downtime-cta` | ZeroDowntimeCtaSection | title, description, 2 CTA buttons (label/href) |
| `grow-with-rotex` | GrowWithRotexSection | title, description, image, CTA (label/href) |
| `achievements` | AchievementsSection | heading, achievements[] (badge type/text), CTA |
| `gallery` | GallerySwiperSection | images[] (upload + alt) |
| `resources` | LearnSection | picker over existing `Resource` model (case studies/news/blogs), selection independent from Home's resources picker |

## Architecture

Mirrors the existing Home CMS implementation:

1. **Data model**: new `AboutSection` Prisma model — `{ key String @id, enabled Boolean @default(true), order Int, data Json, updatedAt DateTime @updatedAt }`. Separate table from `HomeSection` because keys like `hero`/`cta` would otherwise collide. Seed migration inserts current hardcoded defaults (pulled from each component's `default*` constants) as initial `data` for each key, in the table above's order.
2. **Server helper**: `src/lib/about-section.ts` exporting `getAboutSection(key)`, mirroring `src/lib/home-section.ts`.
3. **API routes**: one thin route per key at `src/app/api/v1/about/<key>/route.ts`, each calling `getAboutSection("<key>")` — same shape as the Home routes.
4. **Public fetch helper**: `fetchAboutSection<T>(key)` added to `src/lib/site-api.ts`, following `fetchHomeSection`.
5. **Public page**: `src/app/(site)/about/page.tsx` fetches each section server-side and passes fetched data as props into the existing section components. Components' existing default props act as the fallback if a fetch returns null, so the page never breaks if a row is missing.
6. **Admin list page**: `src/app/admin/(dashboard)/about/page.tsx` — same card/list layout as `/admin/home`, one row per section with an enabled toggle, no drag handle.
7. **Admin edit pages**: `src/app/admin/(dashboard)/about/[key]/page.tsx` renders one form component per key from `src/components/admin/about-sections/`, built from the same shared primitives already used for Home forms (`SectionMeta`, `SaveBar`, `TextField`, `TextAreaField`, `MediaField`, `useFieldArray`, `useSaveAction`).
8. **Server actions**: `src/app/admin/(dashboard)/about/actions.ts` — `saveAboutSection(key, payload)`, `toggleAboutSectionEnabled(key, enabled)`. No reorder action (order is fixed).
9. **Nav**: add "About Page" entry to `src/components/admin/sidebar.tsx`, next to "Home Page".

## Out of scope
- `/about/awards` subpage.
- Section reordering.
- Editing decorative SVG artwork, world-map behavior, achievement badge icon graphics.
