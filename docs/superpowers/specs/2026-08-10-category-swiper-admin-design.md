# Category Swiper + Category Admin — Design

Branch: `feature/categories-products`

## Scope

Make categories a real DB-backed, admin-editable entity with optional
1-level-deep subcategories, and build the home page category swiper
(the "Engineered Flow Control Systems" section) on top of it, seeded from
`public/categories/cat_1.png`–`cat_6.png`.

**Out of scope:** products remain fully static (no DB model, no admin CRUD).
`Product.category` (flat string) is untouched. This is a separate future
phase.

## Data model

New `Category` model in `prisma/schema.prisma`:

```prisma
model Category {
  id        String     @id @default(cuid())
  slug      String     @unique
  name      String
  tagline   String
  image     String?
  order     Int        @default(0)
  published Boolean    @default(true)
  parent    Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  parentId  String?
  children  Category[] @relation("CategoryTree")
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}
```

- Self-relation, 1 level deep only. Admin's "parent" dropdown only lists
  categories that themselves have no parent (prevents nesting > 1 level).
- Delete is blocked server-side while a category still has children — user
  must delete/reparent subcategories first. No cascading delete.

## Seed

One-off seed script maps the 6 existing images to the 6 cards from the
current pasted markup, as top-level categories (`parentId: null`,
`published: true`), `order` 0–5:

| order | image | name | tagline |
|---|---|---|---|
| 0 | cat_1.png | Solenoid Valve | The Component Inside Valves That Cannot Fail |
| 1 | cat_2.png | Angle Seat Valve | Durable flow control for demanding needs |
| 2 | cat_3.png | Actuators | Powerful mechanical devices for valve movement |
| 3 | cat_4.png | Positioners | Precise, digital control for valve positioning |
| 4 | cat_5.png | Automotive Solutions | Custom control solutions for heavy vehicles. |
| 5 | cat_6.png | CTIS | Real-time, automated tyre pressure management |

Slugs are kebab-case of name (`solenoid-valve`, `angle-seat-valve`, etc.) —
matches the `TABS` labels already used on the static products page.

## Admin panel

New `/admin/categories`, following the existing **countries** module pattern
(`src/components/admin/countries/*`, `src/app/admin/(dashboard)/countries/*`):
list + create/edit dialog, not the heavier industries multi-page pattern —
field count doesn't justify dedicated sub-pages.

New files:
- `src/app/admin/(dashboard)/categories/page.tsx` — server page, fetches all
  categories (parents with children nested for display), renders list.
- `src/app/admin/(dashboard)/categories/actions.ts` — server actions:
  `createCategory`, `updateCategory`, `deleteCategory` (with children-guard),
  `listCategories`.
- `src/components/admin/categories/category-list.tsx` — table/list, indents
  or groups subcategories under their parent, edit/delete row actions.
- `src/components/admin/categories/category-form-dialog.tsx` — create/edit
  form: name, slug (auto-generated from name, editable), tagline, image
  (reuse existing `MediaPicker`), parent select (`None` + top-level
  categories), order (number input), published (switch).

Nav: add "Categories" link to the admin dashboard sidebar/nav where
"Countries"/"Industries" etc. already live.

## Home page section

A `HomeSection` row (key `"categories"`) holds only the section chrome:
`enabled`, `heading.title`, `cta { label, href }` — editable via a small
admin form mirroring `src/components/admin/home-sections/products-form.tsx`
(no repeater — just heading + CTA fields, since cards live in `Category`
table now).

New site component (server component) fetches published, top-level
`Category` rows ordered by `order` ascending, and renders them in a
`swiper` (already an installed dependency) carousel:
- Prev/next arrow buttons matching the pasted markup's circular icon-button
  styling, wired to real `swiper` navigation (not decorative).
- Each card: image, name, tagline — matches pasted markup structure/sizing.
- Card `onClick` → `/products?category={slug}`.
- "View All Products" button → `/products` (no filter).

This replaces/sits alongside the existing `products-form.tsx`-driven
"Products" home section — they are separate sections; this spec only adds
the categories one.

## Products page hook-in

`src/app/(site)/products/page.tsx` already has a `TABS` array
(`"All Products"`, `"Solenoid Valve"`, ...) driving client-side filtering
of the static `ALL_PRODUCTS` array. Add: on mount, read `?category=` from
the URL and preselect the matching tab if found (fallback to "All
Products"). No other change to static product data or UI.

## Testing

- Prisma migration applies cleanly; seed script populates 6 categories.
- Admin: create a subcategory, confirm it doesn't appear in the parent
  dropdown for other forms; confirm delete is blocked while it has a child.
- Home page: swiper renders 6 seeded categories in order, arrows scroll,
  card click navigates to `/products?category=solenoid-valve` and
  preselects that tab.
