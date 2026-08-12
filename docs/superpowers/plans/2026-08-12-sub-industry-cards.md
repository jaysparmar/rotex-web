# Sub-industry Application/Why-Choose Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the sub-industry admin's "Challenges" and "Solutions" one-line-per-bullet lists into admin-addable title+description cards, rename the two admin section headers ("Challenges" → "Application", "Solutions" → "Why Choose Rotex for {industry} Industries"), and drop the now-unused `solutionsIntro` field.

**Architecture:** `challenges`/`solutions` change from `string[]` to `{ title: string; description: string }[]` via a new shared `CardList` JSON type (Json-column type-annotation change, no migration needed for those two columns). `solutionsIntro` is a real `String` column and gets dropped via a hand-applied migration (this repo's `prisma migrate dev` shadow-db replay is broken on pre-existing history — same workaround used for the `LegalPage` migration earlier in this session: hand-write `migration.sql`, apply with `sqlite3` directly, then `prisma migrate resolve --applied`). Existing rows get a one-off data-migration script converting their old bullet strings into `{ title: <string>, description: "" }` cards. The admin form swaps two `Textarea`s for two card repeaters (copying the exact `whyChoose.cards` repeater pattern already in `industry-edit-form.tsx`). The public component renders cards instead of flat bullet rows.

**Tech Stack:** Next.js App Router, React, TypeScript, react-hook-form, Prisma (SQLite). No test runner — verification is `tsc --noEmit` + `next build` + manual browser check.

## Global Constraints

- `challengesTitle`, `solutionsTitle`, and the DB/field names `challenges`/`solutions` are unchanged — only their *contents* change shape and the *admin UI labels* around them change. No renaming of Prisma columns for these two.
- `solutionsIntro` is fully removed: column dropped, admin field deleted, public prop deleted.
- Existing `SubIndustry` rows must be migrated (old string bullets → cards with empty description), not dropped or reset.
- No changes to `Industry.whyChoose` (the separate, already-card-shaped sector-level field).

---

### Task 1: `CardList` type + drop `solutionsIntro` column

**Files:**
- Modify: `src/types/prisma-json.d.ts`
- Modify: `prisma/schema.prisma`
- Create: migration under `prisma/migrations/`

**Interfaces:**
- Produces: `PrismaJson.CardList = { title: string; description: string }[]`, used to type `SubIndustry.challenges` and `SubIndustry.solutions`.

- [ ] **Step 1: Add the `CardList` type**

In `src/types/prisma-json.d.ts`, add near `StringList` (line 3):
```ts
type CardList = { title: string; description: string }[];
```

- [ ] **Step 2: Retype the schema columns and drop `solutionsIntro`**

In `prisma/schema.prisma`, in the `SubIndustry` model (currently lines 98-124):
```prisma
model SubIndustry {
  id                  String   @id @default(cuid())
  slug                String
  name                String
  description         String
  image               String?
  /// [StringList]
  partnerIds          Json     @default("[]")
  /// [StringList]
  storyIds            Json     @default("[]")
  challengesTitle     String
  solutionsTitle      String
  /// [CardList]
  challenges          Json
  /// [CardList]
  solutions           Json
  /// [StringList]
  recommendedProducts Json

  industry   Industry @relation(fields: [industryId], references: [id], onDelete: Cascade)
  industryId String

  createdAt DateTime @default(now())

  @@unique([industryId, slug])
}
```
(This removes the `solutionsIntro String` line and changes the two `/// [StringList]` comments above `challenges`/`solutions` to `/// [CardList]`.)

- [ ] **Step 3: Hand-write the migration**

Create `prisma/migrations/20260812010000_subindustry_cards/migration.sql`:
```sql
-- AlterTable
ALTER TABLE "SubIndustry" DROP COLUMN "solutionsIntro";
```
(`challenges`/`solutions` stay `Json` columns in SQLite — no ALTER needed for the type-annotation change, it's a Prisma-client-only concern.)

- [ ] **Step 4: Apply directly and mark resolved**

This repo's `prisma migrate dev` fails on a pre-existing broken migration in history (shadow-db replay), so apply by hand — same approach used for the `LegalPage` migration earlier:
```bash
sqlite3 dev.db 'ALTER TABLE "SubIndustry" DROP COLUMN "solutionsIntro";'
npx prisma migrate resolve --applied "20260812010000_subindustry_cards"
```
Expected: `Migration 20260812010000_subindustry_cards marked as applied.`

- [ ] **Step 5: Regenerate the Prisma client**

Run: `npx prisma generate`
Expected: `✔ Generated Prisma Client` and `✔ Generated Prisma Json Types Generator`. Confirm the new type shows up:
```bash
grep -n "CardList\|solutionsIntro" src/generated/prisma/models/SubIndustry.ts
```
Expected: no `solutionsIntro` field left; `challenges`/`solutions` still typed as `Json` on the Prisma model (the `CardList` typing applies at the `PrismaJson` TS layer used by application code, not the generated Prisma model file itself).

- [ ] **Step 6: Commit**

```bash
git add src/types/prisma-json.d.ts prisma/schema.prisma prisma/migrations
git commit -m "feat: add CardList type, drop SubIndustry.solutionsIntro"
```

---

### Task 2: Migrate existing SubIndustry rows to card shape

**Files:**
- Create: `prisma/migrate-sub-industry-cards.ts` (one-off, deleted after running)

**Interfaces:** none new — data migration only.

- [ ] **Step 1: Write the script**

```ts
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!.replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

function toCards(raw: unknown): { title: string; description: string }[] {
  const items = (raw as unknown[] | null) ?? [];
  // Already migrated rows have objects, not strings — skip re-wrapping them.
  return items.map((item) =>
    typeof item === "string" ? { title: item, description: "" } : (item as { title: string; description: string })
  );
}

async function main() {
  const rows = await prisma.subIndustry.findMany({ select: { id: true, challenges: true, solutions: true } });
  for (const row of rows) {
    await prisma.subIndustry.update({
      where: { id: row.id },
      data: {
        challenges: toCards(row.challenges) as never,
        solutions: toCards(row.solutions) as never,
      },
    });
  }
  console.log(`Migrated ${rows.length} sub-industry rows to card format.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Run it**

Run: `DATABASE_URL="file:./dev.db" npx tsx prisma/migrate-sub-industry-cards.ts`
Expected: prints `Migrated N sub-industry rows to card format.` with no errors.

- [ ] **Step 3: Verify**

Run: `sqlite3 dev.db "SELECT challenges FROM SubIndustry LIMIT 1;"`
Expected: JSON array of objects like `[{"title":"...","description":""}, ...]`, not plain strings.

- [ ] **Step 4: Delete the one-off script**

```bash
rm prisma/migrate-sub-industry-cards.ts
```
(Nothing to commit for this task — it's a data-only change with no file left behind.)

---

### Task 3: Update `SubIndustryData` type in server actions

**Files:**
- Modify: `src/app/admin/(dashboard)/industries/actions.ts`

**Interfaces:**
- Produces: `SubIndustryData` (used by `createSubIndustry`/`updateSubIndustry`) now has `challenges: { title: string; description: string }[]` / `solutions: { title: string; description: string }[]`, and no `solutionsIntro` field.

- [ ] **Step 1: Update the type**

Replace (current lines 19-29):
```ts
type SubIndustryData = {
  slug: string;
  name: string;
  description: string;
  image?: string;
  partnerIds: string[];
  storyIds: string[];
  challengesTitle: string;
  solutionsTitle: string;
  solutionsIntro: string;
  challenges: string[];
  solutions: string[];
};
```
with:
```ts
type SubIndustryData = {
  slug: string;
  name: string;
  description: string;
  image?: string;
  partnerIds: string[];
  storyIds: string[];
  challengesTitle: string;
  solutionsTitle: string;
  challenges: { title: string; description: string }[];
  solutions: { title: string; description: string }[];
};
```
No other change needed in this file — `createSubIndustry`/`updateSubIndustry` spread `...data` straight into Prisma calls.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: errors will surface in `sub-industry-edit-form.tsx` (Task 4 fixes it) — confirm no errors specifically in `actions.ts`.

- [ ] **Step 3: Commit**

```bash
git add "src/app/admin/(dashboard)/industries/actions.ts"
git commit -m "feat: update SubIndustryData type for card-shaped challenges/solutions"
```

---

### Task 4: Admin form — card repeaters, renamed labels, `industryName` prop

**Files:**
- Modify: `src/components/admin/industries/sub-industry-edit-form.tsx`

**Interfaces:**
- Consumes: `RepeaterItem`, `AddButton` from `@/components/admin/form-fields` (already used elsewhere for this exact pattern in `industry-edit-form.tsx`).
- Produces: `SubIndustryEditForm` now requires an `industryName: string` prop.

- [ ] **Step 1: Update imports and types**

Add `useFieldArray` to the react-hook-form import (currently `useForm, FormProvider, Controller` on line 6), and add `RepeaterItem, AddButton` to the form-fields import (line 7):
```ts
import { useForm, FormProvider, Controller, useFieldArray } from "react-hook-form";
import { Field, TextField, TextAreaField, FieldGrid, RepeaterItem, AddButton } from "@/components/admin/form-fields";
```

Replace the `SubIndustryInput` type's `challenges`/`solutions` fields and drop `solutionsTitle`'s sibling `solutionsIntro`. Current (lines 33-47):
```ts
type SubIndustryInput = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  partnerIds: unknown;
  storyIds: unknown;
  challengesTitle: string;
  solutionsTitle: string;
  solutionsIntro: string;
  challenges: unknown;
  solutions: unknown;
  // recommendedProducts: unknown; // TODO: re-enable once wired to the real Product catalog
};
```
becomes:
```ts
type SubIndustryInput = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  partnerIds: unknown;
  storyIds: unknown;
  challengesTitle: string;
  solutionsTitle: string;
  challenges: unknown;
  solutions: unknown;
  // recommendedProducts: unknown; // TODO: re-enable once wired to the real Product catalog
};
```

Replace the `FormValues` type's `challenges: string;` / `solutions: string;` lines (used with `toLines`/`fromLines` today) — those helpers and the `toLines`/`fromLines` free functions are no longer needed for these two fields (still fine to keep if referenced elsewhere, but they're only used for challenges/solutions in this file, so delete `toLines`/`fromLines` entirely). Current `FormValues` (lines 21-31):
```ts
type FormValues = {
  name: string;
  slug: string;
  description: string;
  image: string;
  partnerIds: string[];
  storyIds: string[];
  challengesTitle: string;
  challenges: string;
  solutionsTitle: string;
  solutionsIntro: string;
  solutions: string;
  // recommendedProducts: string; // TODO: re-enable once wired to the real Product catalog
};
```
becomes:
```ts
type CardItem = { title: string; description: string };

type FormValues = {
  name: string;
  slug: string;
  description: string;
  image: string;
  partnerIds: string[];
  storyIds: string[];
  challengesTitle: string;
  challenges: CardItem[];
  solutionsTitle: string;
  solutions: CardItem[];
  // recommendedProducts: string; // TODO: re-enable once wired to the real Product catalog
};
```

Delete the `toLines`/`fromLines` functions (current lines 51-59):
```ts
function toLines(value: unknown): string {
  return ((value as string[] | null) ?? []).join("\n");
}

function fromLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
```

- [ ] **Step 2: Update the component signature and default values**

Change the export signature to accept `industryName` (current lines 65-73):
```ts
export function SubIndustryEditForm({
  industryId,
  subIndustry,
  allPartners,
  allStories,
}: {
  industryId: string;
  subIndustry?: SubIndustryInput;
  allPartners: Partner[];
  allStories: Story[];
}) {
```
becomes:
```ts
export function SubIndustryEditForm({
  industryId,
  industryName,
  subIndustry,
  allPartners,
  allStories,
}: {
  industryId: string;
  industryName: string;
  subIndustry?: SubIndustryInput;
  allPartners: Partner[];
  allStories: Story[];
}) {
```

Update the `useForm` defaults (current lines 76-91) — replace the `challenges`/`solutions`/`solutionsIntro` lines:
```ts
      challengesTitle: subIndustry?.challengesTitle ?? "",
      challenges: toLines(subIndustry?.challenges),
      solutionsTitle: subIndustry?.solutionsTitle ?? "",
      solutionsIntro: subIndustry?.solutionsIntro ?? "",
      solutions: toLines(subIndustry?.solutions),
```
with:
```ts
      challengesTitle: subIndustry?.challengesTitle ?? "",
      challenges: (subIndustry?.challenges as CardItem[] | null) ?? [],
      solutionsTitle: subIndustry?.solutionsTitle ?? "",
      solutions: (subIndustry?.solutions as CardItem[] | null) ?? [],
```

- [ ] **Step 3: Add the field arrays**

Right after the existing `const { pending, error, success, run } = useSaveAction();` line, add:
```ts
  const challengesArray = useFieldArray({ control: form.control, name: "challenges" });
  const solutionsArray = useFieldArray({ control: form.control, name: "solutions" });
```

Remove the now-obsolete `togglePartner`/`toggleStory` are untouched (still needed) — only remove any code referencing `toLines`/`fromLines`.

- [ ] **Step 4: Update `onSubmit`**

Replace (current):
```ts
      challengesTitle: values.challengesTitle,
      solutionsTitle: values.solutionsTitle,
      solutionsIntro: values.solutionsIntro,
      challenges: fromLines(values.challenges),
      solutions: fromLines(values.solutions),
```
with:
```ts
      challengesTitle: values.challengesTitle,
      solutionsTitle: values.solutionsTitle,
      challenges: values.challenges,
      solutions: values.solutions,
```

- [ ] **Step 5: Replace the Challenges card**

Replace the whole "Challenges" `Card` block:
```tsx
        <Card>
          <CardHeader>
            <CardTitle>Challenges</CardTitle>
            <CardDescription>Shown in the left column of the challenges vs. solutions section.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Challenges Title" {...form.register("challengesTitle")} />
            <Controller
              control={form.control}
              name="challenges"
              render={({ field }) => (
                <Field label="Challenges (one per line)">
                  <Textarea {...field} rows={5} />
                </Field>
              )}
            />
          </CardContent>
        </Card>
```
with:
```tsx
        <Card>
          <CardHeader>
            <CardTitle>Application</CardTitle>
            <CardDescription>Cards shown in the left column of the challenges vs. solutions section.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Application Title" {...form.register("challengesTitle")} />
            <div className="space-y-3">
              {challengesArray.fields.map((field, i) => (
                <RepeaterItem key={field.id} title={`Card ${i + 1}`} onRemove={() => challengesArray.remove(i)}>
                  <TextField label="Title" {...form.register(`challenges.${i}.title`)} />
                  <TextAreaField label="Description" {...form.register(`challenges.${i}.description`)} />
                </RepeaterItem>
              ))}
              <AddButton
                label="Add Card"
                onClick={() => challengesArray.append({ title: "", description: "" })}
              />
            </div>
          </CardContent>
        </Card>
```

- [ ] **Step 6: Replace the Solutions card**

Replace the whole "Solutions" `Card` block:
```tsx
        <Card>
          <CardHeader>
            <CardTitle>Solutions</CardTitle>
            <CardDescription>Shown in the right column of the challenges vs. solutions section.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Solutions Title" {...form.register("solutionsTitle")} />
            <TextAreaField label="Solutions Intro" {...form.register("solutionsIntro")} />
            <Controller
              control={form.control}
              name="solutions"
              render={({ field }) => (
                <Field label="Solutions (one per line)">
                  <Textarea {...field} rows={5} />
                </Field>
              )}
            />
          </CardContent>
        </Card>
```
with:
```tsx
        <Card>
          <CardHeader>
            <CardTitle>Why Choose Rotex for {industryName} Industries</CardTitle>
            <CardDescription>Cards shown in the right column of the challenges vs. solutions section.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Solutions Title" {...form.register("solutionsTitle")} />
            <div className="space-y-3">
              {solutionsArray.fields.map((field, i) => (
                <RepeaterItem key={field.id} title={`Card ${i + 1}`} onRemove={() => solutionsArray.remove(i)}>
                  <TextField label="Title" {...form.register(`solutions.${i}.title`)} />
                  <TextAreaField label="Description" {...form.register(`solutions.${i}.description`)} />
                </RepeaterItem>
              ))}
              <AddButton
                label="Add Card"
                onClick={() => solutionsArray.append({ title: "", description: "" })}
              />
            </div>
          </CardContent>
        </Card>
```

- [ ] **Step 7: Clean up now-unused imports**

`Controller` and `Textarea` (the raw `@/components/ui/textarea` one) and `Field` may now be unused in this file — check with:
```bash
grep -n "Controller\|<Textarea\|<Field " src/components/admin/industries/sub-industry-edit-form.tsx
```
The "Challenges (one per line)" / "Solutions Intro" Controller blocks are gone, but the file's Challenges/Solutions repeater `TextAreaField` (a different, already-imported component) doesn't need `Textarea`/`Field`/`Controller` — however this file *also* has no other use of `Controller` elsewhere (double check the whole file), so remove `Controller` from the `react-hook-form` import and remove the `Textarea`/`Field` imports if the grep shows zero remaining uses.

- [ ] **Step 8: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in `sub-industry-edit-form.tsx` itself (errors about missing `industryName` prop at call sites are expected and fixed in Task 5).

- [ ] **Step 9: Commit**

```bash
git add src/components/admin/industries/sub-industry-edit-form.tsx
git commit -m "feat: sub-industry Application/Why-Choose card repeaters, renamed labels"
```

---

### Task 5: Pass `industryName` from both admin pages

**Files:**
- Modify: `src/app/admin/(dashboard)/industries/[id]/sub-industries/[subId]/page.tsx`
- Modify: `src/app/admin/(dashboard)/industries/[id]/sub-industries/new/page.tsx`

**Interfaces:**
- Consumes: `SubIndustryEditForm` from Task 4 (now requires `industryName: string`).

- [ ] **Step 1: Update the edit page**

In `src/app/admin/(dashboard)/industries/[id]/sub-industries/[subId]/page.tsx`, replace:
```tsx
      <SubIndustryEditForm
        industryId={industry.id}
        subIndustry={subIndustry}
        allPartners={allPartners}
        allStories={allStories}
      />
```
with:
```tsx
      <SubIndustryEditForm
        industryId={industry.id}
        industryName={industry.name}
        subIndustry={subIndustry}
        allPartners={allPartners}
        allStories={allStories}
      />
```

- [ ] **Step 2: Update the new page**

In `src/app/admin/(dashboard)/industries/[id]/sub-industries/new/page.tsx`, replace:
```tsx
      <SubIndustryEditForm industryId={industry.id} allPartners={allPartners} allStories={allStories} />
```
with:
```tsx
      <SubIndustryEditForm
        industryId={industry.id}
        industryName={industry.name}
        allPartners={allPartners}
        allStories={allStories}
      />
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in either page or in `sub-industry-edit-form.tsx`.

- [ ] **Step 4: Commit**

```bash
git add "src/app/admin/(dashboard)/industries/[id]/sub-industries/[subId]/page.tsx" "src/app/admin/(dashboard)/industries/[id]/sub-industries/new/page.tsx"
git commit -m "feat: pass industry name into sub-industry edit form for card header"
```

---

### Task 6: Public rendering — cards instead of flat bullets

**Files:**
- Modify: `src/components/sections/industry-challenges-solutions.tsx`
- Modify: `src/components/sections/sub-industry-content.tsx`

**Interfaces:**
- Produces: `IndustryChallengesSolutions` props change — `challenges`/`solutions` are now `{ title: string; description: string }[]`, `solutionsIntro` prop removed.

- [ ] **Step 1: Update the component**

Replace the whole file `src/components/sections/industry-challenges-solutions.tsx`:
```tsx
import { HexIcon } from "@/components/ui/hex-icon";

type Card = { title: string; description: string };

type Props = {
  challengesTitle: string;
  challenges: Card[];
  solutionsTitle: string;
  solutions: Card[];
};

export function IndustryChallengesSolutions({
  challengesTitle,
  challenges,
  solutionsTitle,
  solutions,
}: Props) {
  return (
    <section className="bg-white py-10 lg:py-16">
      <div className="container flex flex-col gap-5 lg:flex-row lg:justify-start lg:items-start lg:gap-16">

        {/* Challenges */}
        {/* zinc-100 (#f4f4f5), not neutral-100 — the theme overrides neutral-100 to a near-white #f9fafb */}
        <div className="flex-1 self-stretch p-5 lg:p-7 bg-zinc-100 rounded-xl flex flex-col gap-5 lg:gap-6">
          <h3 className="text-stone-900 text-xl lg:text-2xl font-medium font-montserrat leading-7 lg:leading-8 line-clamp-5">
            {challengesTitle}
          </h3>
          <div className="flex flex-col">
            {challenges.map((c, i) => (
              <div key={i} className="self-stretch py-2.5 lg:py-3 border-b border-neutral-200 last:border-b-0 flex flex-col justify-center items-start gap-1.25">
                <div className="self-stretch inline-flex justify-start items-start gap-1.25">
                  {/* 24px box holding a 12px glyph, so the bullet tops out with the first line of copy */}
                  <span className="size-6 shrink-0 flex items-start justify-center pt-1.75">
                    <HexIcon size={12} color="#d4d4d4" />
                  </span>
                  <div className="flex-1 flex flex-col gap-1">
                    <p className="text-stone-900 text-sm font-semibold font-montserrat leading-5">{c.title}</p>
                    {c.description && (
                      <p className="text-stone-600 text-sm font-medium font-montserrat leading-5">{c.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Solutions */}
        {/* brand-50 / primary, not red-50 / red-600 — Tailwind's reds are pink-toned and clash with the #ee3e23 bullets */}
        <div className="flex-1 p-5 lg:p-7 bg-brand-50 rounded-xl flex flex-col gap-5 lg:gap-6">
          <h3 className="text-primary text-xl lg:text-2xl font-medium font-montserrat leading-7 lg:leading-8 line-clamp-5">
            {solutionsTitle}
          </h3>
          <div className="flex flex-col">
            {solutions.map((s, i) => (
              <div key={i} className="self-stretch py-2.5 lg:py-3 border-b border-neutral-200 last:border-b-0 flex flex-col justify-center items-start">
                <div className="self-stretch inline-flex justify-start items-start gap-1.25">
                  <span className="size-6 shrink-0 flex items-start justify-center pt-1.75">
                    <HexIcon size={12} />
                  </span>
                  <div className="flex-1 flex flex-col gap-1">
                    <p className="text-stone-900 text-sm font-semibold font-montserrat leading-5">{s.title}</p>
                    {s.description && (
                      <p className="text-stone-600 text-sm font-medium font-montserrat leading-5">{s.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
```
(The `solutionsIntro` paragraph block that used to sit between the solutions `h3` and the bullet list is gone — the `gap-2 lg:gap-3` wrapper `div` around title+intro collapses back to just the `h3`, matching the challenges side's structure.)

- [ ] **Step 2: Update the caller**

In `src/components/sections/sub-industry-content.tsx`, replace (current lines 59-65):
```tsx
      <IndustryChallengesSolutions
        challengesTitle={subIndustry.challengesTitle}
        challenges={subIndustry.challenges as unknown as string[]}
        solutionsTitle={subIndustry.solutionsTitle}
        solutionsIntro={subIndustry.solutionsIntro}
        solutions={subIndustry.solutions as unknown as string[]}
      />
```
with:
```tsx
      <IndustryChallengesSolutions
        challengesTitle={subIndustry.challengesTitle}
        challenges={subIndustry.challenges as unknown as { title: string; description: string }[]}
        solutionsTitle={subIndustry.solutionsTitle}
        solutions={subIndustry.solutions as unknown as { title: string; description: string }[]}
      />
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/industry-challenges-solutions.tsx src/components/sections/sub-industry-content.tsx
git commit -m "feat: render sub-industry application/why-choose cards on the public page"
```

---

### Task 7: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Full typecheck**

Run: `npx tsc --noEmit`
Expected: no errors anywhere.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: succeeds, no new errors/warnings tied to the modified files.

- [ ] **Step 3: Manual verification**

With the dev server running (ask before restarting it if it's not already serving fresh code — this session hit a stale-server issue earlier), in the browser:
- Open an existing sub-industry's admin edit page (e.g. Oil & Gas → Upstream). Confirm the left card now reads "Application" with title-only rows converted to cards showing the old bullet text as each card's title and an empty description field, plus an "Add Card" button.
- Confirm the right card now reads "Why Choose Rotex for Oil & Gas Industries" (or whatever the parent industry's name is), same card repeater shape, no "Solutions Intro" field anywhere.
- Add a new card on each side with both title and description filled in, remove one existing card, save, reload the page, confirm the changes persisted.
- Visit the public sub-industry page (`/industries/oil-gas/upstream` or equivalent) and confirm the challenges/solutions section now renders title+description cards instead of single-line bullets, and that there's no leftover "solutions intro" paragraph.
