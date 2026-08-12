# Sub-industry Application / Why-Choose cards

## Problem
The sub-industry admin form (`src/components/admin/industries/sub-industry-edit-form.tsx`) has two
"one item per line" plain-text lists — Challenges and Solutions — rendered on the public
sub-industry page as flat bullet rows (`src/components/sections/industry-challenges-solutions.tsx`).
Admin wants each bullet to become a title+description card (like the existing
`Industry.whyChoose.cards` pattern already used at the top-level industry), admin-addable/removable
(N cards per side), and the two admin section labels renamed.

## Solution

### Admin labeling (display text only, no field renames)
- Left admin `Card` header: "Challenges" → "Application". Description text updated to match.
- Right admin `Card` header: "Solutions" → `Why Choose Rotex for {industry.name} Industries`
  (computed from the parent industry's name, passed down as a new `industryName` prop to
  `SubIndustryEditForm`). Underlying field names (`challengesTitle`, `challenges`,
  `solutionsTitle`, `solutions`) are unchanged — this is a label-only rename, not a schema rename,
  to avoid unnecessary churn across every call site. The `challengesTitle`/`solutionsTitle` text
  fields themselves are untouched — admin already fully controls the actual on-page heading text
  through those (e.g. "Rotex Solutions for Upstream Applications" in the current screenshot), so
  the admin-section-header rename has no effect on public copy.

### Data shape change
`challenges` and `solutions` change from `string[]` (one bullet per line) to
`{ title: string; description: string }[]` (cards). New shared JSON type:
```prisma
/// [CardList]
```
```ts
// prisma-json.d.ts
type CardList = { title: string; description: string }[];
```
Both `SubIndustry.challenges` and `SubIndustry.solutions` get this type (replacing `StringList`).
This is a Json-column type-annotation change only — no `ALTER TABLE` needed for those two columns.

`solutionsIntro` (`String`, currently a free-text paragraph above the solutions bullets) is
**removed** — the column is dropped via migration, the admin field is deleted, and the public
component prop is deleted. The card format replaces its purpose, matching how `Industry.whyChoose`
already has no separate intro field.

### Data migration (existing rows)
Existing `SubIndustry` rows have `challenges`/`solutions` as flat string arrays and a populated
`solutionsIntro`. A one-off script (matching the `prisma/seed-legal.ts` standalone-script
convention — own `PrismaClient` via `PrismaBetterSqlite3`) converts every row:
- Each existing string becomes `{ title: <the string>, description: "" }` (title carries the old
  bullet text, description starts empty — admin fills it in afterward).
- Run once against the dev database as part of implementation; not a permanent seed script.

### Admin form
`sub-industry-edit-form.tsx`'s "Challenges (one per line)" `Textarea` and "Solutions (one per
line)" `Textarea` are replaced with a card repeater on each side — same `RepeaterItem`/`AddButton`
pattern already used in `industry-edit-form.tsx` for `stats` and `whyChoose.cards`
(`useFieldArray`, each card is a `TextField` for title + `TextAreaField` for description, with
remove buttons and an "Add Card" button). `challengesTitle`/`solutionsTitle` text fields stay as
single `TextField`s above their respective repeaters, unchanged. `solutionsIntro` field is deleted
from the form.

### Public rendering
`industry-challenges-solutions.tsx`: `challenges: string[]` / `solutions: string[]` props become
`challenges: { title: string; description: string }[]` / `solutions: { title: string; description:
string }[]`. The `solutionsIntro: string` prop is removed. Each bullet row becomes a small card:
title (bold) + description below it, replacing the current single-line-with-hex-bullet row —
staying within the existing `bg-zinc-100` (challenges) / `bg-brand-50` (solutions) side panels, not
introducing a new visual container per card (keeps the current two-column look, just richer rows).
`SubIndustryContent` (`src/components/sections/sub-industry-content.tsx`) drops the
`solutionsIntro={subIndustry.solutionsIntro}` prop it currently passes through.

## Out of scope
- No change to the top-level `Industry.whyChoose` (sector-level "Why Choose Rotex" block) — only
  this sub-industry-level challenges/solutions section changes.
- No change to `challengesTitle`/`solutionsTitle` field behavior — still plain text fields, admin
  fully controls the on-page heading copy.
- No reordering UI for cards (add/remove only, same as the existing `stats`/`whyChoose.cards`
  repeaters this pattern is copied from).
