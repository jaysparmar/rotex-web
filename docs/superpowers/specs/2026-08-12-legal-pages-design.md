# Privacy Policy & Terms and Conditions pages

## Problem
The footer already reserves two legal links (`src/components/layout/footer.tsx:10`,
`DISABLED_HREFS = new Set(["/privacy", "/terms"])`) but renders them as disabled dead text because
no pages exist yet. There's no admin-editable legal-content type. TinyMCE
(`@tinymce/tinymce-react`, `tinymce`) and `isomorphic-dompurify` are already installed and already
used end-to-end for rich content on the Resources (News/Blogs/Case Studies) feature
(`src/components/admin/resources/resource-edit-form.tsx`, `src/components/sections/post-detail-section.tsx`)
— this feature follows that exact pattern.

## Solution

### Data model
New Prisma model, section-keyed like `HomeSection`/`AboutSection` but without `order` (these are
two fixed, independent pages, not orderable sections of one page):
```prisma
model LegalPage {
  key       String   @id // "privacy" | "terms"
  title     String
  content   String   // rich HTML from TinyMCE
  updatedAt DateTime @updatedAt
}
```
Migration via `npx prisma migrate dev --name add_legal_page_model` (matches existing migration
convention, e.g. `20260811120000_add_certification_model`).

### Routes
Public pages at `/privacy-policy` and `/terms-and-conditions` (explicit URLs, per decision — not
the currently-reserved `/privacy`/`/terms`). This requires:
- Updating the footer's stored `footer.legal.links` hrefs (and the "Terms of Use" label →
  "Terms & Conditions" to match the new page title) — both in `prisma/seed-home.ts` (for fresh
  installs) and via a one-off `prisma` update against the existing dev database row (so the
  currently-seeded data doesn't stay stale).
- Updating `DISABLED_HREFS` in `footer.tsx` to drop the old `/privacy`/`/terms` entries (the new
  routes are never in that set — they're live pages from the start).

### Admin
- New nav entry in `src/components/admin/sidebar.tsx` `PAGE_ITEMS`: `{ href: "/admin/legal", label: "Legal Pages", icon: Shield }`.
- `src/app/admin/(dashboard)/legal/page.tsx` — simple index listing the two fixed pages (Privacy
  Policy, Terms & Conditions) as cards linking to their edit screens. No create/delete — the two
  keys are fixed.
- `src/app/admin/(dashboard)/legal/[key]/page.tsx` — fetches (or defaults) the `LegalPage` row for
  `key` (`"privacy" | "terms"`, 404 on anything else) and renders `LegalPageForm`.
- `src/components/admin/legal/legal-page-form.tsx` — `title` text field + TinyMCE `content` editor,
  copying the `ContentField` implementation from `resource-edit-form.tsx` (same plugin list,
  toolbar, dark-mode theming, `/api/admin/upload` image handler) into a new shared
  `src/components/admin/rich-text-field.tsx` component — this de-duplicates the TinyMCE setup
  instead of copy-pasting ~90 lines, and `resource-edit-form.tsx` is *not* touched/refactored to
  use it (out of scope, avoid regression risk on a working feature).
- `src/app/admin/(dashboard)/legal/actions.ts` — `saveLegalPage(key, { title, content })` using
  `prisma.legalPage.upsert`, plus `revalidatePath` for both the admin and public routes.

### Public rendering
- `src/app/(site)/privacy-policy/page.tsx` and `src/app/(site)/terms-and-conditions/page.tsx` —
  thin pages that fetch the `LegalPage` row by key and render a shared
  `src/components/sections/legal-page-section.tsx` (title + `DOMPurify.sanitize(content)` via
  `dangerouslySetInnerHTML`, same sanitize call shape as `post-detail-section.tsx`). Uses
  `PageHero` (`src/components/ui/page-hero.tsx`) for the title banner, matching how other simple
  static pages open.
- Prose styling: extract the existing `post-detail-section.module.css` rules into a shared
  `src/components/sections/rich-content.module.css` and import it from both
  `post-detail-section.tsx` (swap its import, identical CSS, zero visual change) and the new
  `legal-page-section.tsx`. Avoids duplicating ~150 lines of prose CSS.
- If a `LegalPage` row doesn't exist yet for a key (shouldn't happen after seeding, but defensive),
  the page 404s via `notFound()`.

### Dummy data
Seed both rows with placeholder legal copy (a handful of standard headed sections — e.g. "1.
Information We Collect", "2. How We Use It" for Privacy; "1. Acceptance of Terms", "2. Use of
Service" for Terms — filler paragraph text, clearly placeholder, admin replaces it later) via
`prisma/seed-legal.ts`, called from `prisma/seed.ts` like the other `seed-*.ts` modules.

## Out of scope
- No versioning/history of legal page edits — last-saved content only, like every other section.
- No "enabled" toggle — these are always-on pages once seeded (can't meaningfully disable a
  Privacy Policy link once real content exists).
- No refactor of `resource-edit-form.tsx`'s existing TinyMCE usage beyond extracting the reusable
  piece — its own file keeps working exactly as before.
- No changes to `/api/admin/upload` (reused as-is for in-editor image uploads).
