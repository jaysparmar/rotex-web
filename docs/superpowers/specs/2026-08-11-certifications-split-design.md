# Split Certifications out of Partner model

## Problem

`Partner` table currently holds two unrelated things: real business partners (Scania,
Cummins, Shell, ...) and certification-body logos (CE, EX, SIL3, IATF, inmetro, ISI,
KOSHA, PCT, PED, UL). The admin `/admin/partners` page lists both mixed together. The
only thing separating them is the `certifications` HomeSection's `partnerIds` array,
which happens to reference exactly the 10 certification-logo rows.

Confirmed live state (root `dev.db`, the DB actually used at runtime — not the stale
`prisma/dev.db`):
- `Partner` table: 18 rows `partner_001..partner_018` (real partners) + 10 rows with
  cuid ids (CE, EX, SIL3, IATF, inmetro, ISI, KOSHA, PCT, PED, UL).
- `HomeSection` key `"partners"`: `data.partnerIds` = the 18 `partner_XXX` ids.
- `HomeSection` key `"certifications"`: `data.partnerIds` = exactly the 10 cuid ids.

## Decisions

- New `Certification` Prisma model, same shape as `Partner` (id, name, logo, published,
  createdAt, updatedAt).
- Admin CRUD for certifications mirrors the existing Partners feature exactly (list +
  add/edit dialog + publish toggle + delete), just pointed at the new model.
- New sidebar nav entry "Certifications", placed directly under "Partners", reusing the
  already-imported `Award` icon from `lucide-react`.
- `/admin/home/certifications` keeps its current picker UX (title, description, toggle
  each certification logo in/out) — just sourced from `Certification` instead of
  `Partner`.
- Data migration: one-off script that reads the current `certifications` HomeSection's
  `partnerIds`, copies those exact Partner rows into `Certification` (preserving id,
  name, logo, published), deletes them from `Partner`, and rewrites the HomeSection's
  JSON field from `partnerIds` to `certificationIds` (same id values, since the rows
  keep their original ids).
- Public site output shape is unchanged (`getHomeSection` already returns
  `{enabled, title, description, logos}` regardless of source table), so
  `TrustedLeaders`, the home page, and `/api/v1/home/certifications` need no changes.
- Seed file (`prisma/seed-home.ts`) gets a new `CERTIFICATIONS` array (10 entries) and a
  seeding loop; the `certifications` HomeSection entry switches from
  `partnerIds: PARTNERS.map(...)` to `certificationIds: CERTIFICATIONS.map(...)`.

## Scope / non-goals

- No changes to the real Partner CRUD, Partner model fields, or the `partners` home
  section — those stay exactly as they are today.
- No changes to public-facing rendering — this is a backend/admin data-model fix only.
- Not touching the stale duplicate `prisma/dev.db` file — out of scope, unrelated to
  this task.

## Changes

### `prisma/schema.prisma`
Add, next to the `Partner` model:
```prisma
model Certification {
  id        String   @id @default(cuid())
  name      String
  logo      String
  published Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```
Run `npx prisma migrate dev --name add_certification_model` to generate + apply the
migration (creates the table; existing tables untouched).

### `scripts/migrate-certifications-from-partners.ts` (new, one-off)
- Import `prisma` from `@/lib/prisma` (so it hits the same DB the app uses at runtime).
- Read `HomeSection.findUnique({ where: { key: "certifications" } })`.
- Extract `data.partnerIds` (the 10 ids).
- For each id: fetch the `Partner` row, `prisma.certification.create({ data: { id, name, logo, published } })`.
- Delete those 10 rows from `Partner`.
- Update the HomeSection: `data = { title, description, certificationIds: partnerIds }`
  (drop the old `partnerIds` key).
- Log a summary (rows moved, HomeSection updated).
- Run once manually via `npx tsx scripts/migrate-certifications-from-partners.ts`.

### `src/lib/certifications.ts` (new)
Mirrors `src/lib/partners.ts`:
```ts
export async function getSelectedCertifications(ids: string[]) { ... } // prisma.certification.findMany({ where: { id: { in: ids }, published: true } })
export async function getPublishedCertifications() { ... } // prisma.certification.findMany({ where: { published: true } })
```

### `src/lib/home-section.ts`
In `getHomeSection`, split the combined `key === "partners" || key === "certifications"`
branch:
```ts
if (key === "partners") {
  const partners = await getSelectedPartners((data.partnerIds as string[]) ?? []);
  const logos = partners.map((p) => ({ id: p.id, src: p.logo, alt: p.name }));
  return apiSuccess({ enabled: section.enabled, title: data.title, description: data.description, logos }, section.updatedAt);
}

if (key === "certifications") {
  const certifications = await getSelectedCertifications((data.certificationIds as string[]) ?? []);
  const logos = certifications.map((c) => ({ id: c.id, src: c.logo, alt: c.name }));
  return apiSuccess({ enabled: section.enabled, title: data.title, description: data.description, logos }, section.updatedAt);
}
```

### `src/app/admin/(dashboard)/certifications/` (new, mirrors `partners/`)
- `page.tsx`: `prisma.certification.findMany({ orderBy: { createdAt: "asc" } })` → `<CertificationList certifications={...} />`.
- `actions.ts`: `createCertification`, `updateCertification`, `deleteCertification`,
  `toggleCertificationPublished` — same shape as the Partner actions, operating on
  `prisma.certification`, revalidating `/admin/certifications` and
  `/admin/home/certifications`.

### `src/components/admin/certifications/` (new, mirrors `src/components/admin/partners/`)
- `certification-list.tsx`: copy of `partner-list.tsx`, renamed type/props/imports.
- `certification-form-dialog.tsx`: copy of `partner-form-dialog.tsx`, renamed
  type/props/imports, calling the new actions.

### `src/components/admin/home-sections/certifications-picker-form.tsx`
Rename prop `allPartners` → `allCertifications`, form field `partnerIds` →
`certificationIds`. Logic otherwise unchanged (same toggle-in-array pattern).

### `src/app/admin/(dashboard)/home/[key]/page.tsx`
Split the combined partners/certifications query:
```ts
const allPartners = key === "partners"
  ? await prisma.partner.findMany({ where: { published: true }, orderBy: { createdAt: "asc" }, select: { id: true, name: true, logo: true } })
  : [];

const allCertifications = key === "certifications"
  ? await prisma.certification.findMany({ where: { published: true }, orderBy: { createdAt: "asc" }, select: { id: true, name: true, logo: true } })
  : [];
```
Pass `allCertifications` to `<CertificationsPickerForm>` instead of `allPartners`.

### `src/components/admin/sidebar.tsx`
In `NAV_ITEMS`, insert right after the Partners entry:
```ts
{ href: "/admin/certifications", label: "Certifications", icon: Award },
```
(`Award` already imported for the Awards nav entry.)

### `prisma/seed-home.ts`
- Add `CERTIFICATIONS` array (10 entries: CE, EX, SIL3, IATF, inmetro, ISI, KOSHA, PCT,
  PED, UL) with placeholder `logo` paths following the existing `https://cdn.rotex.com/...`
  seed convention.
- Add a seeding loop alongside the existing `for (const partner of PARTNERS)` loop:
  `for (const cert of CERTIFICATIONS) { await prisma.certification.create({ data: cert }); }`.
- Change the `certifications` SECTIONS entry:
  `certificationIds: CERTIFICATIONS.map((c) => c.id)` instead of
  `partnerIds: PARTNERS.map((p) => p.id)`.
- Update the final `console.log` summary line to mention certifications count.

## Testing

- After migration script runs: `/admin/partners` shows only the 18 real partners (CE/EX/etc gone).
- `/admin/certifications` (new page) shows the 10 certification logos with working
  add/edit/delete/publish-toggle.
- `/admin/home/certifications` picker shows the 10 certifications (not partners), title/
  description still editable and saved.
- `/admin/home/partners` picker still shows the 18 real partners, unaffected.
- Home page: both "Trusted by Industry Leaders" and certifications sections still render
  their respective logos exactly as before the migration (visually unchanged).
- `npx tsc --noEmit` and `npm run build` succeed.
