# Picker Grid + Lightbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the row-list UI in the 4 home-section picker forms (Certifications, Partners, Customer Stories, Resources) with a shared grid component that shows a click-to-zoom image lightbox and a corner toggle switch.

**Architecture:** One new controlled, stateless component `ItemPickerGrid` in `src/components/admin/item-picker-grid.tsx` renders a responsive grid of cards (image + label + sublabel + toggle). It reuses the existing `ImageLightboxTrigger` (`src/components/admin/image-lightbox.tsx`) for click-to-preview and the existing `Switch` (`src/components/ui/switch.tsx`) for enable/disable. Each of the 4 picker forms swaps its inline row-list JSX for a single `<ItemPickerGrid />` call, keeping all react-hook-form state/logic (`selected`, `toggle()`) unchanged.

**Tech Stack:** Next.js (App Router), React, TypeScript, react-hook-form, Tailwind, shadcn/ui (`Dialog`, `Switch`), no test runner in this repo — verification is `tsc`/`next build` + manual browser check.

## Global Constraints

- No changes to data layer, server actions, or Prisma models — UI-only swap.
- No changes to `certification-list.tsx` / `partner-list.tsx` (standalone admin list pages) — out of scope per spec.
- Keep each picker form's existing `toggle()` / `selected` react-hook-form wiring untouched; only the rendered list markup changes.
- New component must be fully controlled (no internal selection state) so it's a drop-in replacement.

---

### Task 1: Build shared `ItemPickerGrid` component

**Files:**
- Create: `src/components/admin/item-picker-grid.tsx`

**Interfaces:**
- Produces:
  ```ts
  type PickerItem = { id: string; image: string; label: string; sublabel?: string };

  function ItemPickerGrid(props: {
    items: PickerItem[];
    selectedIds: string[];
    onToggle: (id: string, checked: boolean) => void;
    emptyMessage: string;
    imageFit?: "contain" | "cover"; // default "contain"
  }): JSX.Element
  ```
- Consumes: `ImageLightboxTrigger` from `@/components/admin/image-lightbox` (props: `src`, `alt`, `className`, `children`), `Switch` from `@/components/ui/switch` (props: `checked`, `onCheckedChange`), `cn` from `@/lib/utils`.

- [ ] **Step 1: Write the component**

```tsx
"use client";

import Image from "next/image";
import { ImageLightboxTrigger } from "@/components/admin/image-lightbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type PickerItem = { id: string; image: string; label: string; sublabel?: string };

export function ItemPickerGrid({
  items,
  selectedIds,
  onToggle,
  emptyMessage,
  imageFit = "contain",
}: {
  items: PickerItem[];
  selectedIds: string[];
  onToggle: (id: string, checked: boolean) => void;
  emptyMessage: string;
  imageFit?: "contain" | "cover";
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border p-4">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const checked = selectedIds.includes(item.id);
        return (
          <div
            key={item.id}
            className="flex flex-col gap-2 rounded-md border border-border p-2"
          >
            <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-muted/30">
              <ImageLightboxTrigger src={item.image} alt={item.label} className="size-full">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.label}
                    fill
                    unoptimized
                    className={cn(
                      imageFit === "contain" ? "object-contain p-2" : "object-cover"
                    )}
                  />
                )}
              </ImageLightboxTrigger>
              <Switch
                checked={checked}
                onCheckedChange={(v) => onToggle(item.id, v)}
                className="absolute right-1.5 top-1.5 bg-background/80 backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.label}</p>
              {item.sublabel && (
                <p className="truncate text-xs text-muted-foreground">{item.sublabel}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors referencing `item-picker-grid.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/item-picker-grid.tsx
git commit -m "feat: add shared ItemPickerGrid component with image lightbox"
```

---

### Task 2: Swap Certifications picker form to grid

**Files:**
- Modify: `src/components/admin/home-sections/certifications-picker-form.tsx`

**Interfaces:**
- Consumes: `ItemPickerGrid`, `PickerItem` from Task 1 (`@/components/admin/item-picker-grid`).

- [ ] **Step 1: Replace the row-list block and imports**

Remove the `Image` import (no longer used directly) and add:
```ts
import { ItemPickerGrid } from "@/components/admin/item-picker-grid";
```

Replace this block (lines 63-90 in the current file):
```tsx
        <div className="space-y-1 rounded-lg border border-border">
          {allCertifications.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No published certifications yet. Add some on the Certifications page first.
            </p>
          )}
          {allCertifications.map((certification) => (
            <div key={certification.id} className="flex items-center gap-4 border-b border-border p-4 last:border-b-0">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
                {certification.logo && (
                  <Image
                    src={certification.logo}
                    alt={certification.name}
                    width={40}
                    height={40}
                    className="size-full object-contain"
                    unoptimized
                  />
                )}
              </div>
              <span className="flex-1 text-sm font-medium">{certification.name}</span>
              <Switch
                checked={selected.includes(certification.id)}
                onCheckedChange={(v) => toggle(certification.id, v)}
              />
            </div>
          ))}
        </div>
```

with:
```tsx
        <ItemPickerGrid
          items={allCertifications.map((c) => ({ id: c.id, image: c.logo, label: c.name }))}
          selectedIds={selected}
          onToggle={toggle}
          emptyMessage="No published certifications yet. Add some on the Certifications page first."
        />
```

Also remove the now-unused `Switch` import if nothing else in the file uses it (check the file — `Switch` is only used in the block being removed, so drop `import { Switch } from "@/components/ui/switch";`).

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in `certifications-picker-form.tsx`.

- [ ] **Step 3: Manual verification**

Run `npm run dev`, open `/admin/home` (or wherever the Certifications home-section editor is, per the screenshot breadcrumb "Home Page > Certifications"), confirm:
- Items render as a responsive grid (2 cols mobile, 3 sm, 4 lg).
- Clicking a logo opens the lightbox dialog with the full image.
- Toggling the switch still updates selection (Save and reload to confirm persistence).

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/home-sections/certifications-picker-form.tsx
git commit -m "feat: switch certifications picker to grid view with lightbox"
```

---

### Task 3: Swap Partners picker form to grid

**Files:**
- Modify: `src/components/admin/home-sections/partners-picker-form.tsx`

**Interfaces:**
- Consumes: `ItemPickerGrid` from Task 1.

- [ ] **Step 1: Replace the row-list block and imports**

Remove the `Image` import and add:
```ts
import { ItemPickerGrid } from "@/components/admin/item-picker-grid";
```

Replace this block (lines 61-88 in the current file):
```tsx
        <div className="space-y-1 rounded-lg border border-border">
          {allPartners.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No published partners yet. Add some on the Partners page first.
            </p>
          )}
          {allPartners.map((partner) => (
            <div key={partner.id} className="flex items-center gap-4 border-b border-border p-4 last:border-b-0">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
                {partner.logo && (
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={40}
                    height={40}
                    className="size-full object-contain"
                    unoptimized
                  />
                )}
              </div>
              <span className="flex-1 text-sm font-medium">{partner.name}</span>
              <Switch
                checked={selected.includes(partner.id)}
                onCheckedChange={(v) => toggle(partner.id, v)}
              />
            </div>
          ))}
        </div>
```

with:
```tsx
        <ItemPickerGrid
          items={allPartners.map((p) => ({ id: p.id, image: p.logo, label: p.name }))}
          selectedIds={selected}
          onToggle={toggle}
          emptyMessage="No published partners yet. Add some on the Partners page first."
        />
```

Remove the now-unused `Switch` import.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in `partners-picker-form.tsx`.

- [ ] **Step 3: Manual verification**

In the running dev server, open the Partners home-section editor, confirm grid renders, lightbox opens on click, toggle + save still works.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/home-sections/partners-picker-form.tsx
git commit -m "feat: switch partners picker to grid view with lightbox"
```

---

### Task 4: Swap Customer Stories picker form to grid

**Files:**
- Modify: `src/components/admin/home-sections/customer-stories-picker-form.tsx`

**Interfaces:**
- Consumes: `ItemPickerGrid` from Task 1.

- [ ] **Step 1: Replace the row-list block and imports**

Remove the `Image` import and add:
```ts
import { ItemPickerGrid } from "@/components/admin/item-picker-grid";
```

Replace this block (lines 66-96 in the current file):
```tsx
        <div className="space-y-1 rounded-lg border border-border">
          {allStories.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No published customer stories yet. Add some on the Customer Stories page first.
            </p>
          )}
          {allStories.map((story) => (
            <div key={story.id} className="flex items-center gap-4 border-b border-border p-4 last:border-b-0">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
                {story.image && (
                  <Image
                    src={story.image}
                    alt={story.author}
                    width={40}
                    height={40}
                    className="size-full object-cover"
                    unoptimized
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{story.author}, {story.company}</p>
                <p className="truncate text-xs text-muted-foreground">{story.quote}</p>
              </div>
              <Switch
                checked={selected.includes(story.id)}
                onCheckedChange={(v) => toggle(story.id, v)}
              />
            </div>
          ))}
        </div>
```

with:
```tsx
        <ItemPickerGrid
          items={allStories.map((s) => ({
            id: s.id,
            image: s.image,
            label: `${s.author}, ${s.company}`,
            sublabel: s.quote,
          }))}
          selectedIds={selected}
          onToggle={toggle}
          emptyMessage="No published customer stories yet. Add some on the Customer Stories page first."
          imageFit="cover"
        />
```

Remove the now-unused `Switch` import.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in `customer-stories-picker-form.tsx`.

- [ ] **Step 3: Manual verification**

In the running dev server, open the Customer Stories home-section editor, confirm grid renders with photo + quote sublabel, lightbox opens on click, toggle + save still works.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/home-sections/customer-stories-picker-form.tsx
git commit -m "feat: switch customer stories picker to grid view with lightbox"
```

---

### Task 5: Swap Resources picker (`ResourcePicker` inner component) to grid

**Files:**
- Modify: `src/components/admin/home-sections/resources-picker-form.tsx`

**Interfaces:**
- Consumes: `ItemPickerGrid` from Task 1.

- [ ] **Step 1: Replace the row-list block inside `ResourcePicker` and imports**

Remove the `Image` import and add:
```ts
import { ItemPickerGrid } from "@/components/admin/item-picker-grid";
```

Replace this block (lines 100-127 in the current file, inside the `ResourcePicker` function):
```tsx
      <div className="rounded-lg border border-border">
        {options.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            No published resources of this type yet. Add some on the Resources page first.
          </p>
        )}
        {options.map((resource) => (
          <div key={resource.id} className="flex items-center gap-4 border-b border-border p-4 last:border-b-0">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
              {resource.image && (
                <Image
                  src={resource.image}
                  alt={resource.title}
                  width={40}
                  height={40}
                  className="size-full object-cover"
                  unoptimized
                />
              )}
            </div>
            <span className="flex-1 truncate text-sm font-medium">{resource.title}</span>
            <Switch
              checked={selected.includes(resource.id)}
              onCheckedChange={(v) => toggle(resource.id, v)}
            />
          </div>
        ))}
      </div>
```

with:
```tsx
      <ItemPickerGrid
        items={options.map((r) => ({ id: r.id, image: r.image, label: r.title }))}
        selectedIds={selected}
        onToggle={toggle}
        emptyMessage="No published resources of this type yet. Add some on the Resources page first."
        imageFit="cover"
      />
```

Remove the now-unused `Switch` import (check `ResourcesPickerForm` outer function too — `Switch` is only used inside `ResourcePicker`, so it's safe to drop the import for the whole file).

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in `resources-picker-form.tsx`.

- [ ] **Step 3: Manual verification**

In the running dev server, open the Resources home-section editor, confirm each tab's resource grid renders, lightbox opens on click, toggle + save still works per tab.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/home-sections/resources-picker-form.tsx
git commit -m "feat: switch resources picker to grid view with lightbox"
```

---

### Task 6: Full build verification

**Files:** none (verification only)

- [ ] **Step 1: Run full typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: build succeeds with no new errors/warnings tied to the modified files.

- [ ] **Step 3: Manual smoke test in browser**

Run `npm run dev`, visit each of the 4 home-section editors (Certifications, Partners, Customer Stories, Resources) under `/admin/home`, verify for each: grid renders responsively, image click opens lightbox, toggle switch works and persists after Save + page reload.
