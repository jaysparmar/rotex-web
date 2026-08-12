# Industries Home Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the home page "Industries" section admin screen pick real Industries (checkbox + up/down reorder) and drive what actually renders on the public home page, replacing a dead hand-entered repeater that today has zero effect (the home page always shows every industry, unfiltered, unordered).

**Architecture:** `industries-form.tsx` swaps its `useFieldArray` repeater for a checkbox+reorder list (same logic already proven in `mega-menu-editor.tsx`'s `IndustriesPicker`), storing an ordered `industryIds: string[]` instead of duplicated industry data. The admin `[key]/page.tsx` fetches `allIndustries` the same way it fetches `allCertifications`/`allPartners`. The public `(site)/page.tsx` filters+orders the already-fetched full industries list by `industryIds` instead of passing it straight through.

**Tech Stack:** Next.js App Router, React, TypeScript, react-hook-form, Prisma, Tailwind. No test runner in this repo — verification is `tsc --noEmit` + `next build` + manual browser check via a Playwright script (project has `playwright` as a dependency; no `chromium-cli`/project run-skill exists yet).

## Global Constraints

- No changes to the `Industry` Prisma model or schema — no migration needed, `industryIds` lives inside the existing JSON `data` column on `HomeSection`.
- No changes to the standalone `/admin/industries` CRUD pages or `mega-menu-editor.tsx` (only its pattern is reused, not its code).
- Default behavior when `industryIds` is absent (fresh/unmigrated data): treat as "all current industries, in existing order" — must not make the section disappear or go empty on deploy.
- Section heading (`heading.title` / `heading.subtitle`) fields are unchanged.

---

### Task 1: Rewrite the admin form to a live-data picker

**Files:**
- Modify: `src/components/admin/home-sections/industries-form.tsx` (full rewrite of the body)

**Interfaces:**
- Consumes: `Checkbox` from `@/components/ui/checkbox` (props: `checked`, `onCheckedChange`), `ChevronUp`/`ChevronDown` from `lucide-react`.
- Produces: `IndustriesForm` now takes an additional required prop `allIndustries: { id: string; name: string }[]`. Saved `data` shape becomes `{ heading: { title: string; subtitle: string }; industryIds: string[] }` (was `{ heading, industries: IndustryCard[] }`).

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import { useForm, FormProvider, useWatch } from "react-hook-form";
import { ChevronUp, ChevronDown } from "lucide-react";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField } from "@/components/admin/form-fields";
import { Checkbox } from "@/components/ui/checkbox";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveHomeSection } from "@/app/admin/(dashboard)/home/actions";

type IndustryOption = { id: string; name: string };
type FormValues = {
  enabled: boolean;
  heading: { title: string; subtitle: string };
  industryIds: string[];
};

export function IndustriesForm({
  initialEnabled,
  initialData,
  allIndustries,
}: {
  initialEnabled: boolean;
  initialData: { heading: { title: string; subtitle: string }; industryIds?: string[] };
  allIndustries: IndustryOption[];
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      heading: initialData.heading,
      industryIds: initialData.industryIds ?? allIndustries.map((i) => i.id),
    },
  });
  const { pending, error, success, run } = useSaveAction();
  const selected: string[] = useWatch({ control: form.control, name: "industryIds" }) ?? [];

  function toggle(id: string, checked: boolean) {
    const current = form.getValues("industryIds");
    form.setValue("industryIds", checked ? [...current, id] : current.filter((v) => v !== id));
  }

  function move(id: string, direction: -1 | 1) {
    const current = form.getValues("industryIds");
    const idx = current.indexOf(id);
    const swapWith = idx + direction;
    if (idx === -1 || swapWith < 0 || swapWith >= current.length) return;
    const next = [...current];
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    form.setValue("industryIds", next);
  }

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveHomeSection("industries", { enabled, data });
        toast.success("Industries section saved");
      } catch (err) {
        toast.error("Failed to save industries section");
        throw err;
      }
    });
  }

  const orderedIndustries = [...allIndustries].sort((a, b) => {
    const aChecked = selected.includes(a.id);
    const bChecked = selected.includes(b.id);
    if (aChecked && bChecked) return selected.indexOf(a.id) - selected.indexOf(b.id);
    if (aChecked) return -1;
    if (bChecked) return 1;
    return 0;
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading Title" {...form.register("heading.title")} />
        <TextAreaField label="Heading Subtitle" {...form.register("heading.subtitle")} />

        <div className="space-y-1 rounded-lg border border-border">
          {allIndustries.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No industries yet. Add some on the Industries page first.
            </p>
          )}
          {orderedIndustries.map((industry) => {
            const checked = selected.includes(industry.id);
            const orderIdx = selected.indexOf(industry.id);
            return (
              <div
                key={industry.id}
                className="flex items-center gap-2.5 border-b border-border p-4 last:border-b-0"
              >
                <label className="flex flex-1 items-center gap-2.5">
                  <Checkbox checked={checked} onCheckedChange={(v) => toggle(industry.id, v === true)} />
                  <span className="text-sm font-medium">{industry.name}</span>
                </label>
                {checked && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Move up"
                      disabled={orderIdx === 0}
                      onClick={() => move(industry.id, -1)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                    >
                      <ChevronUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={orderIdx === selected.length - 1}
                      onClick={() => move(industry.id, 1)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                    >
                      <ChevronDown className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
```

Note: add `import { toast } from "sonner";` at the top alongside the other imports (matches the pattern in `certifications-picker-form.tsx`).

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: errors only in `src/app/admin/(dashboard)/home/[key]/page.tsx` (missing `allIndustries` prop — fixed in Task 2) and `src/app/(site)/page.tsx` (still passing old shape — fixed in Task 3). No errors inside `industries-form.tsx` itself.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/home-sections/industries-form.tsx
git commit -m "feat: replace industries home-section repeater with live-data picker+reorder"
```

---

### Task 2: Fetch real industries in the admin section page and pass them through

**Files:**
- Modify: `src/app/admin/(dashboard)/home/[key]/page.tsx`

**Interfaces:**
- Consumes: `IndustriesForm` from Task 1 (now requires `allIndustries: { id: string; name: string }[]`).

- [ ] **Step 1: Add the conditional fetch**

Add this block near the other `allX` fetches (after the `allResources` block, before the `return`):

```ts
  const allIndustries =
    key === "industries"
      ? await prisma.industry.findMany({
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true },
        })
      : [];
```

- [ ] **Step 2: Pass the prop**

Replace:
```tsx
      {key === "industries" && <IndustriesForm {...meta} initialData={data} />}
```
with:
```tsx
      {key === "industries" && (
        <IndustriesForm {...meta} initialData={data} allIndustries={allIndustries} />
      )}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in `[key]/page.tsx`.

- [ ] **Step 4: Commit**

```bash
git add "src/app/admin/(dashboard)/home/[key]/page.tsx"
git commit -m "feat: fetch industries for the home-section industries picker"
```

---

### Task 3: Make the public homepage respect the selected order/subset

**Files:**
- Modify: `src/app/(site)/page.tsx`

**Interfaces:**
- Consumes: `industriesSection.industryIds: string[]` (Task 1's saved shape), `industriesList.industries: IndustryCard[]` (unchanged, from `fetchIndustries`).

- [ ] **Step 1: Update the heading data type**

Replace:
```ts
type IndustriesHeadingData = { heading: { title: string; subtitle: string } };
```
with:
```ts
type IndustriesHeadingData = { heading: { title: string; subtitle: string }; industryIds: string[] };
```

- [ ] **Step 2: Compute the ordered/filtered list and use it in the section entry**

Add, right after `const industriesList = await fetchIndustries<{ industries: IndustryCard[] }>();`:
```ts
  const orderedIndustries = (industriesSection?.industryIds ?? [])
    .map((id) => industriesList?.industries.find((i) => i.id === id))
    .filter((i): i is IndustryCard => Boolean(i));
```

Replace the `industries` section entry:
```tsx
    {
      id: "industries",
      order: industriesSection?.order ?? 0,
      node:
        industriesSection?.enabled && industriesList && industriesList.industries.length > 0 ? (
          <IndustriesSection
            key="industries"
            heading={industriesSection.heading}
            industries={industriesList.industries}
          />
        ) : null,
    },
```
with:
```tsx
    {
      id: "industries",
      order: industriesSection?.order ?? 0,
      node:
        industriesSection?.enabled && orderedIndustries.length > 0 ? (
          <IndustriesSection
            key="industries"
            heading={industriesSection.heading}
            industries={orderedIndustries}
          />
        ) : null,
    },
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors anywhere in the previously-flagged files.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(site\)/page.tsx
git commit -m "feat: render home page industries by admin-selected order/subset"
```

---

### Task 4: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Full typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: succeeds, no new errors/warnings tied to the modified files.

- [ ] **Step 3: Manual verification via Playwright script**

The project has no `chromium-cli`/run-skill; use the local `playwright` devDependency directly.
Start the dev server if not already running (`npm run dev`, wait for `http://localhost:3000` to
respond), then run a script (place at repo root temporarily, delete after — it must run from the
repo root so `node` resolves the local `playwright` package):

```js
import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ colorScheme: 'dark', viewport: { width: 1280, height: 900 } });
page.on('pageerror', e => console.log('PAGE ERROR:', e.message));

await page.goto('http://localhost:3000/admin/login');
await page.fill('input[type="email"], input[name="email"]', 'admin@rotex.com');
await page.fill('input[type="password"], input[name="password"]', 'changeme123');
await page.click('button[type="submit"]');
await page.waitForTimeout(1500);

await page.goto('http://localhost:3000/admin/home/industries');
await page.waitForTimeout(1200);
await page.screenshot({ path: 'industries-admin.png', fullPage: true });

// uncheck the first industry, move the second one up, save
const firstCheckbox = page.locator('input[type="checkbox"], button[role="checkbox"]').first();
await firstCheckbox.click();
await page.locator('button[aria-label="Move up"]').first().click();
await page.click('button[type="submit"]');
await page.waitForTimeout(1000);

await page.goto('http://localhost:3000/');
await page.waitForTimeout(1500);
await page.screenshot({ path: 'home-industries.png', fullPage: true });

await browser.close();
```

Verify:
- Admin screenshot shows a checkbox list of real industry names (not the old repeater UI) with
  up/down arrows next to checked rows.
- Unchecking one and reordering, then saving, succeeds (no error toast).
- Homepage screenshot's Industries section reflects the reduced/reordered set (compare tab labels
  / accordion items against what was left checked).
- No `PAGE ERROR` logged.

Revert the test toggle/reorder afterward if this was run against a shared dev database (re-check
the box, save again) so the demo data isn't left altered — or note it for the user if unsure
whether to revert.
