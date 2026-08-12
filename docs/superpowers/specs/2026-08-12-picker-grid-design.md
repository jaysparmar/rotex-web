# Picker grid + image lightbox for home-section pickers

## Problem
Admin picker forms for Certifications, Partners, Customer Stories, and Resources
(`src/components/admin/home-sections/*-picker-form.tsx`) render selectable items as a
40x40-thumbnail flex row list. Hard to visually scan logos and no way to preview an image
before toggling. All four forms share the exact same row markup, duplicated 4x.

## Solution
Extract a shared `ItemPickerGrid` component and use it in all four picker forms.

### Component: `src/components/admin/item-picker-grid.tsx`
```ts
type PickerItem = { id: string; image: string; label: string; sublabel?: string };

function ItemPickerGrid({
  items,
  selectedIds,
  onToggle,
  emptyMessage,
  imageFit = "contain", // "contain" for logos, "cover" for photos
}: {
  items: PickerItem[];
  selectedIds: string[];
  onToggle: (id: string, checked: boolean) => void;
  emptyMessage: string;
  imageFit?: "contain" | "cover";
})
```

- Layout: `grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4` cards in a bordered container
  (matches existing Certifications admin list grid convention).
- Card: square image area, `ImageLightboxTrigger` (existing component, already used in
  certification-list.tsx / partner-list.tsx) wraps the image so click opens the full-size
  preview dialog. `Switch` pinned top-right corner of the image as an overlay (small, on a
  translucent backdrop so it's visible over any logo color). Label truncated below the image;
  sublabel (used by Customer Stories/Resources) truncated smaller below that.
- Empty state: renders `emptyMessage` text when `items` is empty (same text each form already has).
- No internal state — purely controlled via `selectedIds` + `onToggle`, so each form keeps its
  own react-hook-form wiring unchanged aside from swapping the row-list JSX for
  `<ItemPickerGrid items={...} selectedIds={selected} onToggle={toggle} emptyMessage="..." />`.

### Call sites to update (row list → `ItemPickerGrid`)
1. `certifications-picker-form.tsx` — items from `allCertifications` (logo, contain)
2. `partners-picker-form.tsx` — items from `allPartners` (logo, contain)
3. `customer-stories-picker-form.tsx` — items from `allStories`, label=`${author}, ${company}`, sublabel=`quote` (cover)
4. `resources-picker-form.tsx` (inner `ResourcePicker`) — items from filtered `options`, label=`title` (cover)

No data-layer or schema changes. No change to save/submit logic — only the list markup swaps.

## Out of scope
- The standalone Certifications/Partners *admin list* pages (`certification-list.tsx`,
  `partner-list.tsx`) already have grid + lightbox; not touched.
- About page currently has no certifications section — not adding one (user's "or any other
  page" refers to the existing pickers above, confirmed as Partners/Customer Stories/Resources).
