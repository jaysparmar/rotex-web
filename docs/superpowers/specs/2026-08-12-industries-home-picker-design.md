# Home page Industries section: live-data picker + reorder

## Problem
The "Industries" home-page section admin form (`src/components/admin/home-sections/industries-form.tsx`)
lets an admin hand-enter a duplicate copy of each industry (slug, label, title, description,
image) via a repeater. This data is **dead**: the public homepage
(`src/app/(site)/page.tsx:54-101`) ignores the home section's `industries` array entirely — it
fetches *all* industries from `/api/v1/industries` (unfiltered, creation-order) and renders every
one via `IndustriesSection`. So today an admin has no way to control which industries appear on
the home page or in what order; editing the section's industry cards does nothing.

## Solution
Replace the manual repeater with a picker (mirrors the existing "Industries (live data)" mega-menu
picker in `src/components/admin/home-sections/mega-menu-editor.tsx:95-208`, which already has this
exact checkbox + up/down-reorder pattern for industries): admin checks which real Industries show
on the home page and reorders the checked ones. Section heading (title/subtitle) is unchanged.
Wire the public homepage to actually respect this selection/order instead of showing everything.

### Data shape change
`HomeSection` row with `key: "industries"`, `data` JSON changes from:
```ts
{ heading: { title, subtitle }, industries: IndustryCard[] /* dead, hand-entered */ }
```
to:
```ts
{ heading: { title, subtitle }, industryIds: string[] /* ordered, references Industry.id */ }
```

### Admin form: `src/components/admin/home-sections/industries-form.tsx`
- Keep `heading.title` / `heading.subtitle` fields as-is.
- Replace the `useFieldArray` repeater with a checkbox list of all Industries (fetched by the
  parent page, same pattern as `allCertifications`/`allPartners`), each row showing `industry.name`
  + up/down reorder buttons for checked rows — copy the `moveIndustry`/`toggleIndustry`/ordering
  logic from `mega-menu-editor.tsx`'s `IndustriesPicker` (no sub-industries needed here, this
  section doesn't show them).
- On submit, save `{ heading, industryIds: selectedIds }`.

### Admin data fetch: `src/app/admin/(dashboard)/home/[key]/page.tsx`
Add, alongside the existing `allPartners`/`allCertifications`/etc conditional fetches:
```ts
const allIndustries =
  key === "industries"
    ? await prisma.industry.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true } })
    : [];
```
Pass `allIndustries={allIndustries}` to `IndustriesForm`.

### Migration / default behavior
`Industry` has no `published` flag — all industries are eligible. Existing saved sections have no
`industryIds` (old shape had `industries: [...]` cards, or the key may not exist yet). Default:
if `industryIds` is missing/undefined, the admin form initializes selection to **all current
industry ids in their existing (createdAt) order** — matching today's "show everything" behavior,
so nothing breaks on deploy. Once the admin saves (even without changing anything), `industryIds`
becomes explicit.

### Public homepage: `src/app/(site)/page.tsx`
- `IndustriesHeadingData` type gains `industryIds: string[]`.
- Replace the direct `industriesList.industries` pass-through with an ordered/filtered lookup:
  ```ts
  const orderedIndustries = (industriesSection?.industryIds ?? [])
    .map((id) => industriesList?.industries.find((i) => i.id === id))
    .filter((i): i is IndustryCard => Boolean(i));
  ```
  Pass `orderedIndustries` to `<IndustriesSection industries={orderedIndustries} />`, and gate
  the section's inclusion on `orderedIndustries.length > 0` instead of
  `industriesList.industries.length > 0`.
- If `industriesSection` itself is null/not-yet-saved (fresh install, no row), keep existing
  behavior (section doesn't render — matches how other sections already null-guard).

## Out of scope
- No changes to the `Industry` Prisma model, the standalone Industries admin CRUD pages, or
  sub-industries.
- No changes to the mega-menu's own industries picker — only reusing its ordering logic pattern.
- No "published" flag added to `Industry` — all industries remain selectable/eligible, same as
  the standalone `/industries` listing today.
