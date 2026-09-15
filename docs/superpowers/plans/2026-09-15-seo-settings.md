# SEO Settings (static pages) + Dynamic Favicon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give admins a "SEO Settings" panel to edit per-page meta title/description/keywords/OG image/canonical/noindex/JSON-LD schema for all 16 static public pages, wire that data into real `<head>` output (currently zero pages have any), and make the site favicon admin-editable.

**Architecture:** A new `SeoPage` Prisma model (one row per fixed page key, JSON blob) replaces the existing dead `HomeSeo` singleton, following the same "one row per key" shape `HomeSection` already establishes elsewhere in this codebase. `src/lib/seo.ts` provides `getPageSeo(key)` (upsert-on-read, so no seed step) and `buildMetadata()`, consumed by a `generateMetadata()` export added to each of the 16 static `page.tsx` files. A generic admin form (`/admin/seo/[key]`) edits every key with the same shape — unlike `HomeSection`'s per-key branching, since every SEO record has identical fields. Favicon rides along on the existing `GlobalConfig` singleton and its existing header admin form.

**Tech Stack:** Next.js App Router (`generateMetadata`), Prisma + SQLite, `react-hook-form` (admin forms only, no resolver — matches existing convention), existing admin UI kit (`form-fields.tsx`, `MediaField`, `SaveBar`/`useSaveAction`).

**Spec:** `docs/superpowers/specs/2026-09-15-seo-settings-design.md`

## Global Constraints

- No test framework exists in this repo — verification is `tsc --noEmit` + curl against the dev server + manual admin-form check, per established project convention (see prior plan's Global Constraints for the same statement).
- SQLite: plain Prisma `contains`/queries only, no `mode: "insensitive"` (not directly relevant here — no new search/contains queries in this plan, noted for consistency).
- Follow existing admin conventions exactly: `react-hook-form` + `FormProvider`, no zod/validation library in admin forms (validation here is limited to the one explicit JSON.parse check on the schema field), `useSaveAction` + `SaveBar` for save UX (not `sonner` toast — this codebase uses both patterns but `useSaveAction`/`SaveBar` is what the `HomeSeo` precedent and singleton-style forms use), Server Actions (`"use server"`) not REST API routes for admin writes, `src/components/admin/breadcrumb.tsx` on every admin sub-page header.
- Favicon field shape is `{ src: string }` (object, not a bare string) specifically so the existing `MediaField` component (which expects `${name}.src`/`${name}.alt`) can be reused as-is with `showAlt={false}` — a deliberate small deviation from the spec's `favicon: string` wording, made during planning for consistency with the only existing media-picking component in this codebase.
- `SeoMetaData.keywords` is `string[]` in the database/server-action layer; the admin form internally represents it as `{ value: string }[]` only because `react-hook-form`'s `useFieldArray` requires an array of objects — convert at the form's load/submit boundary, never let the object-wrapped shape leak into `src/lib/seo.ts` or the Server Action signature.
- `src/lib/seo.ts`'s `getPageSeo` performs an upsert (write) during what is otherwise a read path (page render / `generateMetadata`). This is intentional and idempotent (`update: {}` is a no-op if the row exists) — it's how this plan avoids needing a seed script, matching the requirement "add once, edit forever" with zero migration-time seeding.

---

### Task 1: Prisma schema — add `SeoPage`, drop `HomeSeo`, remove its dead admin UI

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/types/prisma-json.d.ts`
- Modify: `src/app/admin/(dashboard)/home/actions.ts`
- Modify: `src/app/admin/(dashboard)/home/page.tsx`
- Delete: `src/app/admin/(dashboard)/home/seo/page.tsx`
- Delete: `src/components/admin/home-sections/seo-form.tsx`
- Create: a Prisma migration (via `npx prisma migrate dev`, not hand-written)

**Interfaces:**
- Produces: Prisma model `SeoPage { key: String @id, data: Json /* [SeoMetaData] */, updatedAt: DateTime }`, and `PrismaJson.SeoMetaData` type — both load-bearing for every later task in this plan.
- Produces: `PrismaJson.GlobalConfigData.favicon?: { src: string }` — load-bearing for Task 4.

The existing `HomeSeo` model/admin editor (`/admin/home/seo`) is confirmed dead code — nothing on the live site reads it, and its data was never functional. This task replaces it outright rather than trying to preserve/migrate its row's data (there is nothing user-facing to preserve).

- [ ] **Step 1: Edit `prisma/schema.prisma`**

Find this block (around line 283):
```prisma
model HomeSeo {
  id        String   @id @default("home")
  /// [HomeSeoData]
  data      Json
  updatedAt DateTime @updatedAt
}
```
Replace it with:
```prisma
model SeoPage {
  key       String   @id
  /// [SeoMetaData]
  data      Json
  updatedAt DateTime @updatedAt
}
```

Find the `GlobalConfig` model:
```prisma
model GlobalConfig {
  id        String   @id @default("global")
  /// [GlobalConfigData]
  data      Json
  updatedAt DateTime @updatedAt
}
```
Leave it exactly as-is — the `favicon` field goes into the `GlobalConfigData` TypeScript type in Step 2, not the Prisma schema (it's already a loosely-typed `Json` column).

- [ ] **Step 2: Edit `src/types/prisma-json.d.ts`**

Remove the `HomeSeoData` type:
```ts
    type HomeSeoData = {
      title: string;
      description: string;
      og_image: { src: string; alt: string };
      canonical: string;
    };
```

Add, in its place:
```ts
    type SeoMetaData = {
      title: string;
      description: string;
      keywords: string[];
      ogImage: { src: string; alt: string };
      canonical: string;
      noindex: boolean;
      schema: string;
    };
```

Find the `GlobalConfigData` type:
```ts
    type GlobalConfigData = {
      logo: { src: string; alt: string; href: string };
      header: { nav: NavItem[]; cta: { label: string; href: string } };
```
Add a `favicon` field right after `logo`:
```ts
    type GlobalConfigData = {
      logo: { src: string; alt: string; href: string };
      favicon?: { src: string };
      header: { nav: NavItem[]; cta: { label: string; href: string } };
```

- [ ] **Step 3: Remove `saveHomeSeo` from `src/app/admin/(dashboard)/home/actions.ts`**

Delete this function entirely:
```ts
export async function saveHomeSeo(data: PrismaJson.HomeSeoData) {
  await prisma.homeSeo.update({ where: { id: "home" }, data: { data } });

  revalidatePath("/admin/home");
  revalidatePath("/admin/home/seo");
}
```

- [ ] **Step 4: Remove the "Edit SEO" link from `src/app/admin/(dashboard)/home/page.tsx`**

Replace:
```tsx
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Home Page</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag to reorder sections shown on the public home page.
          </p>
        </div>
        <Link href="/admin/home/seo">
          <Button variant="outline">Edit SEO</Button>
        </Link>
      </div>
```
with:
```tsx
      <div>
        <h1 className="text-2xl font-semibold">Home Page</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag to reorder sections shown on the public home page.
        </p>
      </div>
```
Then remove the now-unused imports at the top of the same file:
```ts
import Link from "next/link";
import { Button } from "@/components/ui/button";
```
(Check the rest of the file first — if `Button` or `Link` are used elsewhere in it, keep those specific imports; based on the file as read during planning, neither is used elsewhere, but verify before deleting.)

- [ ] **Step 5: Delete the dead files**

```bash
rm "src/app/admin/(dashboard)/home/seo/page.tsx"
rm "src/components/admin/home-sections/seo-form.tsx"
```
If `src/app/admin/(dashboard)/home/seo/` is now an empty directory, it can be left (Next.js ignores empty route directories) or removed with `rmdir`.

- [ ] **Step 6: Generate and apply the migration**

```bash
npx prisma migrate dev --name add_seo_page_drop_home_seo
```
This will prompt/generate a new timestamped folder under `prisma/migrations/`. Accept the generated migration (it should contain a `DROP TABLE "HomeSeo"` and `CREATE TABLE "SeoPage"` — review the generated SQL before confirming to ensure no other table is affected).

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit -p .`
Expected: no errors referencing `HomeSeo`, `HomeSeoData`, `saveHomeSeo`, or the deleted files. (Later tasks in this plan add the consumers of `SeoPage`/`SeoMetaData` — until then, those new types are simply unused, which is not a type error.)

Run: `npm run dev` (if not already running), then `curl -sI http://localhost:3000/admin/home` — confirm `200` and that the page no longer references `/admin/home/seo`.

- [ ] **Step 8: Commit**

```bash
git add prisma/schema.prisma prisma/migrations src/types/prisma-json.d.ts \
  "src/app/admin/(dashboard)/home/actions.ts" "src/app/admin/(dashboard)/home/page.tsx"
git add -u "src/app/admin/(dashboard)/home/seo" "src/components/admin/home-sections/seo-form.tsx"
git commit -m "refactor: replace dead HomeSeo model with generalized SeoPage; add favicon to GlobalConfigData"
```

---

### Task 2: `src/lib/seo.ts` + `SeoJsonLd` component

**Files:**
- Create: `src/lib/seo.ts`
- Create: `src/components/seo/seo-json-ld.tsx`

**Interfaces:**
- Consumes: `PrismaJson.SeoMetaData` (Task 1), `prisma` from `@/lib/prisma`.
- Produces (consumed by Task 3's admin pages and Task 5's public pages):
  - `export type SeoMetaData = PrismaJson.SeoMetaData`
  - `export const SEO_PAGES: { key: string; label: string; path: string }[]` — the fixed 16-entry list.
  - `export const SITE_METADATA_FALLBACK: { title: string; description: string }`
  - `export const getPageSeo: (key: string) => Promise<SeoMetaData>` (wrapped in React's `cache()` so a `generateMetadata()` call and the page body's own call within the same request share one DB round trip).
  - `export function buildMetadata(seo: SeoMetaData, fallback: { title: string; description: string }): Metadata`
  - `export function SeoJsonLd({ schema }: { schema: string }): JSX.Element | null` from `src/components/seo/seo-json-ld.tsx`.

- [ ] **Step 1: Write `src/lib/seo.ts`**

```ts
import { cache } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export type SeoMetaData = PrismaJson.SeoMetaData;

export const SITE_METADATA_FALLBACK = {
  title: "Rotex | Industrial Solutions",
  description: "Leading provider of industrial rotary solutions and equipment",
};

export const SEO_PAGES: { key: string; label: string; path: string }[] = [
  { key: "home", label: "Home", path: "/" },
  { key: "products", label: "Products", path: "/products" },
  { key: "downloads", label: "Downloads", path: "/downloads" },
  { key: "blogs", label: "Blogs", path: "/blogs" },
  { key: "case-studies", label: "Case Studies", path: "/case-studies" },
  { key: "news-updates", label: "News & Updates", path: "/news-updates" },
  { key: "about", label: "About", path: "/about" },
  { key: "about-awards", label: "Awards", path: "/about/awards" },
  { key: "contact", label: "Contact", path: "/contact" },
  { key: "join-career", label: "Careers", path: "/join/career" },
  { key: "join-channel-partner", label: "Channel Partner", path: "/join/channel-partner" },
  { key: "join-partner-sales-tools", label: "Partner Sales Tools", path: "/join/partner-sales-tools" },
  { key: "join-supplier", label: "Supplier", path: "/join/supplier" },
  { key: "privacy-policy", label: "Privacy Policy", path: "/privacy-policy" },
  { key: "terms-and-conditions", label: "Terms & Conditions", path: "/terms-and-conditions" },
  { key: "search", label: "Search Results", path: "/search" },
];

function defaultSeoMeta(key: string): SeoMetaData {
  return {
    title: "",
    description: "",
    keywords: [],
    ogImage: { src: "", alt: "" },
    canonical: "",
    noindex: key === "search",
    schema: "",
  };
}

export const getPageSeo = cache(async (key: string): Promise<SeoMetaData> => {
  const row = await prisma.seoPage.upsert({
    where: { key },
    update: {},
    create: { key, data: defaultSeoMeta(key) as never },
  });
  return row.data as SeoMetaData;
});

export function buildMetadata(seo: SeoMetaData, fallback: { title: string; description: string }): Metadata {
  const title = seo.title.trim() || fallback.title;
  const description = seo.description.trim() || fallback.description;

  const metadata: Metadata = {
    title,
    description,
    robots: seo.noindex ? { index: false, follow: false } : { index: true, follow: true },
  };

  if (seo.keywords.length > 0) metadata.keywords = seo.keywords;
  if (seo.canonical.trim()) metadata.alternates = { canonical: seo.canonical.trim() };
  if (seo.ogImage.src.trim()) {
    metadata.openGraph = { images: [{ url: seo.ogImage.src, alt: seo.ogImage.alt || title }] };
  }

  return metadata;
}
```

- [ ] **Step 2: Write `src/components/seo/seo-json-ld.tsx`**

```tsx
export function SeoJsonLd({ schema }: { schema: string }) {
  const trimmed = schema.trim();
  if (!trimmed) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(parsed) }}
    />
  );
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit -p .`
Expected: no errors in either new file. (`prisma.seoPage` must resolve — if it doesn't, Task 1's migration/`prisma generate` step didn't run; check `npx prisma generate` has been run, which `prisma migrate dev` does automatically.)

- [ ] **Step 4: Commit**

```bash
git add src/lib/seo.ts src/components/seo/seo-json-ld.tsx
git commit -m "feat: add seo lib (getPageSeo, buildMetadata) and SeoJsonLd component"
```

---

### Task 3: Admin SEO Settings UI

**Files:**
- Create: `src/components/admin/seo/seo-meta-fields.tsx`
- Create: `src/components/admin/seo/seo-form.tsx`
- Create: `src/app/admin/(dashboard)/seo/actions.ts`
- Create: `src/app/admin/(dashboard)/seo/page.tsx`
- Create: `src/app/admin/(dashboard)/seo/[key]/page.tsx`
- Modify: `src/components/admin/sidebar.tsx`

**Interfaces:**
- Consumes: `SeoMetaData`, `SEO_PAGES`, `getPageSeo` from `@/lib/seo` (Task 2); `TextField`, `TextAreaField`, `FieldGrid`, `SwitchField`, `AddButton`, `RepeaterItem` from `@/components/admin/form-fields`; `MediaField` from `@/components/admin/media-field`; `SaveBar` from `@/components/admin/section-form-shell`; `useSaveAction` from `@/hooks/use-save-action`; `Breadcrumb` from `@/components/admin/breadcrumb`; `Card`/`CardContent` from `@/components/ui/card`; `Textarea` from `@/components/ui/textarea`.
- Produces: `saveSeoPage(key: string, data: SeoMetaData): Promise<void>` Server Action; admin routes `/admin/seo` and `/admin/seo/[key]`.

- [ ] **Step 1: Write `src/components/admin/seo/seo-meta-fields.tsx`**

```tsx
"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { TextField, TextAreaField } from "@/components/admin/form-fields";
import { cn } from "@/lib/utils";

function counterClassName(length: number, guideline: number, max: number): string {
  if (length > max) return "text-destructive";
  if (length > guideline) return "text-amber-500";
  return "text-muted-foreground";
}

export function TitleField({
  name,
  label = "Title",
  guideline = 60,
  max = 70,
}: {
  name: string;
  label?: string;
  guideline?: number;
  max?: number;
}) {
  const form = useFormContext();
  const value = useWatch({ control: form.control, name }) as string | undefined;
  const length = value?.length ?? 0;

  return (
    <div className="space-y-1.5">
      <TextField label={label} {...form.register(name)} />
      <p className={cn("text-xs", counterClassName(length, guideline, max))}>
        {length} / {guideline} characters
      </p>
    </div>
  );
}

export function DescriptionField({
  name,
  label = "Description",
  guideline = 160,
  max = 180,
}: {
  name: string;
  label?: string;
  guideline?: number;
  max?: number;
}) {
  const form = useFormContext();
  const value = useWatch({ control: form.control, name }) as string | undefined;
  const length = value?.length ?? 0;

  return (
    <div className="space-y-1.5">
      <TextAreaField label={label} rows={3} {...form.register(name)} />
      <p className={cn("text-xs", counterClassName(length, guideline, max))}>
        {length} / {guideline} characters
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/admin/seo/seo-form.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { SaveBar } from "@/components/admin/section-form-shell";
import { TextField, FieldGrid, SwitchField, AddButton, RepeaterItem } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { Textarea } from "@/components/ui/textarea";
import { TitleField, DescriptionField } from "@/components/admin/seo/seo-meta-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveSeoPage } from "@/app/admin/(dashboard)/seo/actions";
import type { SeoMetaData } from "@/lib/seo";

type FormValues = {
  title: string;
  description: string;
  keywords: { value: string }[];
  ogImage: { src: string; alt: string };
  canonical: string;
  noindex: boolean;
  schema: string;
};

function toFormValues(data: SeoMetaData): FormValues {
  return { ...data, keywords: data.keywords.map((value) => ({ value })) };
}

function toSeoMetaData(values: FormValues): SeoMetaData {
  return { ...values, keywords: values.keywords.map((k) => k.value).filter(Boolean) };
}

export function SeoForm({ pageKey, initialData }: { pageKey: string; initialData: SeoMetaData }) {
  const form = useForm<FormValues>({ defaultValues: toFormValues(initialData) });
  const { pending, error, success, run } = useSaveAction();
  const keywords = useFieldArray({ control: form.control, name: "keywords" });
  const [schemaError, setSchemaError] = useState<string>();

  function onSubmit(values: FormValues) {
    const trimmedSchema = values.schema.trim();
    if (trimmedSchema) {
      try {
        JSON.parse(trimmedSchema);
      } catch {
        setSchemaError("Schema must be valid JSON.");
        return;
      }
    }
    setSchemaError(undefined);
    run(() => saveSeoPage(pageKey, toSeoMetaData(values)));
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TitleField name="title" />
        <DescriptionField name="description" />

        <div className="space-y-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Keywords</span>
          {keywords.fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Keyword ${i + 1}`} onRemove={() => keywords.remove(i)}>
              <TextField label="Keyword" {...form.register(`keywords.${i}.value`)} />
            </RepeaterItem>
          ))}
          <AddButton label="Add Keyword" onClick={() => keywords.append({ value: "" })} />
        </div>

        <div className="space-y-4 rounded-lg border border-border p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Open Graph Image</span>
          <MediaField name="ogImage" mediaType="image" />
        </div>

        <FieldGrid>
          <TextField label="Canonical URL" {...form.register("canonical")} />
        </FieldGrid>

        <SwitchField
          label="Noindex (hide this page from search engines)"
          checked={form.watch("noindex")}
          onCheckedChange={(v) => form.setValue("noindex", v)}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Schema (JSON-LD)
          </label>
          <Textarea rows={8} className="font-mono text-xs" {...form.register("schema")} />
          {schemaError && <p className="text-xs text-destructive">{schemaError}</p>}
          <p className="text-xs text-muted-foreground">
            Optional. Paste raw JSON-LD structured data (e.g. Organization, WebPage). Must be valid JSON.
          </p>
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
```

- [ ] **Step 3: Write `src/app/admin/(dashboard)/seo/actions.ts`**

```ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { SeoMetaData } from "@/lib/seo";

export async function saveSeoPage(key: string, data: SeoMetaData) {
  await prisma.seoPage.upsert({
    where: { key },
    update: { data: data as never },
    create: { key, data: data as never },
  });

  revalidatePath("/admin/seo");
  revalidatePath(`/admin/seo/${key}`);
}
```

- [ ] **Step 4: Write `src/app/admin/(dashboard)/seo/page.tsx`**

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { SEO_PAGES, type SeoMetaData } from "@/lib/seo";

export default async function AdminSeoPage() {
  const rows = await prisma.seoPage.findMany();
  const byKey = new Map(rows.map((r) => [r.key, r.data as SeoMetaData]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">SEO Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Meta title, description, keywords, and structured data for every public page.
        </p>
      </div>

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {SEO_PAGES.map((page) => {
            const data = byKey.get(page.key);
            const configured = Boolean(data?.title?.trim());
            return (
              <Link
                key={page.key}
                href={`/admin/seo/${page.key}`}
                className="flex items-center justify-between gap-4 p-4 hover:bg-accent"
              >
                <div>
                  <p className="text-sm font-medium">{page.label}</p>
                  <p className="text-xs text-muted-foreground">{page.path}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    configured ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {configured ? "Configured" : "Not set"}
                </span>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 5: Write `src/app/admin/(dashboard)/seo/[key]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { SeoForm } from "@/components/admin/seo/seo-form";
import { SEO_PAGES, getPageSeo } from "@/lib/seo";

export default async function AdminSeoEditPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const page = SEO_PAGES.find((p) => p.key === key);
  if (!page) notFound();

  const data = await getPageSeo(key);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{page.label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{page.path}</p>
        </div>
        <Breadcrumb items={[{ label: "SEO Settings", href: "/admin/seo" }, { label: page.label }]} />
      </div>

      <SeoForm pageKey={key} initialData={data} />
    </div>
  );
}
```

- [ ] **Step 6: Add the sidebar nav entry**

In `src/components/admin/sidebar.tsx`, add `Search` to the `lucide-react` import list:
```ts
import {
  LayoutDashboard,
  Package,
  Factory,
  Home,
  Info,
  Settings,
  Handshake,
  Quote,
  Mail,
  BookOpen,
  Globe,
  Award,
  Phone,
  Layers,
  ChevronDown,
  Images,
  Briefcase,
  Truck,
  FileText,
  Download,
  Wrench,
  Shield,
  Building2,
  SlidersHorizontal,
  Tag,
  Search,
} from "lucide-react";
```

Add a row to `PAGE_ITEMS` (after `Legal Pages`, since SEO Settings applies across all pages like the Legal Pages entry does):
```ts
const PAGE_ITEMS = [
  { href: "/admin/home", label: "Home Page", icon: Home },
  { href: "/admin/about", label: "About Page", icon: Info },
  { href: "/admin/contact", label: "Contact Page", icon: Phone },
  { href: "/admin/channel-partner", label: "Channel Partner Page", icon: Handshake },
  { href: "/admin/career", label: "Career Page", icon: Briefcase },
  { href: "/admin/supplier", label: "Supplier Page", icon: Truck },
  { href: "/admin/partner-sales-tools", label: "Partner Sales Tools", icon: Wrench },
  { href: "/admin/legal", label: "Legal Pages", icon: Shield },
  { href: "/admin/seo", label: "SEO Settings", icon: Search },
];
```

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit -p .` — expect no new errors.

Run the dev server, visit `/admin/seo` — confirm all 16 rows render with correct labels/paths, all show "Not set". Click into `/admin/seo/home`, fill in Title/Description, add a keyword, set an OG image via the picker, type invalid JSON into the Schema field and save — confirm an inline "Schema must be valid JSON." error appears and the save is blocked; fix the JSON (e.g. `{"@type":"Organization"}`) and save again — confirm "Saved." appears. Revisit `/admin/seo` — confirm the Home row now shows "Configured".

- [ ] **Step 8: Commit**

```bash
git add src/components/admin/seo "src/app/admin/(dashboard)/seo" src/components/admin/sidebar.tsx
git commit -m "feat: add SEO Settings admin UI (list + per-page editor)"
```

---

### Task 4: Dynamic favicon

**Files:**
- Modify: `src/components/admin/home-sections/header-config-form.tsx`
- Modify: `src/app/admin/(dashboard)/global/header/page.tsx`
- Modify: `src/app/(site)/layout.tsx`

**Interfaces:**
- Consumes: `PrismaJson.GlobalConfigData.favicon` (Task 1), `MediaField` (existing), `getResolvedGlobalConfig` (existing, `src/lib/global-config.ts`).

- [ ] **Step 1: Edit `src/components/admin/home-sections/header-config-form.tsx`**

Update the `FormValues` type:
```ts
type FormValues = {
  logo: { src: string; alt: string; href: string };
  favicon: { src: string };
  header: { nav: PrismaJson.NavItem[]; cta: { label: string; href: string } };
};
```

Update `onSubmit`:
```ts
  function onSubmit(values: FormValues) {
    run(() => saveGlobalConfig({ logo: values.logo, favicon: values.favicon, header: values.header, footer } as never));
  }
```

Add a Favicon field right after the Logo section:
```tsx
        <section className="space-y-4">
          <h2 className="text-sm font-semibold">Logo</h2>
          <MediaField name="logo" mediaType="image" />
          <TextField label="Href" {...form.register("logo.href")} />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold">Favicon</h2>
          <MediaField name="favicon" mediaType="image" showAlt={false} previewFit="contain" />
        </section>
```

- [ ] **Step 2: Edit `src/app/admin/(dashboard)/global/header/page.tsx`**

Update the `initialData` passed to `HeaderConfigForm`:
```tsx
      <HeaderConfigForm
        initialData={{ logo: config.logo, favicon: config.favicon ?? { src: "" }, header: config.header }}
        footer={config.footer}
        industries={industries}
        productCategories={productCategories}
        blogs={blogs.map((b) => ({ slug: b.slug, title: b.title }))}
      />
```

- [ ] **Step 3: Edit `src/app/(site)/layout.tsx`**

Replace the static `metadata` export with a dynamic `generateMetadata` function that reads the favicon from `getResolvedGlobalConfig()` (already fetched in the component body — call it once more here since `generateMetadata` and the layout component run separately; this is the same acceptable duplicate-fetch tradeoff used elsewhere in this codebase, and `getResolvedGlobalConfig` is a cheap single-row read plus two small resolves):

Replace:
```ts
export const metadata: Metadata = {
  title: "Rotex | Industrial Solutions",
  description: "Leading provider of industrial rotary solutions and equipment",
};
```
with:
```ts
export async function generateMetadata(): Promise<Metadata> {
  const config = await getResolvedGlobalConfig();
  return {
    title: "Rotex | Industrial Solutions",
    description: "Leading provider of industrial rotary solutions and equipment",
    icons: config.favicon?.src ? { icon: config.favicon.src } : undefined,
  };
}
```
Leave the rest of the file (the `SiteLayout` component itself) unchanged — Next.js merges this layout's `generateMetadata` result with each page's own `generateMetadata` (added in Task 5), and since no page sets `icons`, the favicon set here carries through to every page automatically.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit -p .` — expect no new errors.

Run the dev server, visit `/admin/global/header`, upload/pick a favicon image, save. Then `curl -s http://localhost:3000/ | grep -o '<link rel="icon"[^>]*>'` — confirm it reflects the chosen image URL. Confirm `/` still returns 200 and renders normally otherwise.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/home-sections/header-config-form.tsx \
  "src/app/admin/(dashboard)/global/header/page.tsx" "src/app/(site)/layout.tsx"
git commit -m "feat: make site favicon admin-editable"
```

---

### Task 5: Wire `generateMetadata` + `SeoJsonLd` into all 16 static pages

**Files:**
- Modify: `src/app/(site)/page.tsx`
- Modify: `src/app/(site)/products/page.tsx`
- Modify: `src/app/(site)/downloads/page.tsx`
- Modify: `src/app/(site)/blogs/page.tsx`
- Modify: `src/app/(site)/case-studies/page.tsx`
- Modify: `src/app/(site)/news-updates/page.tsx`
- Modify: `src/app/(site)/about/page.tsx`
- Modify: `src/app/(site)/about/awards/page.tsx`
- Modify: `src/app/(site)/contact/page.tsx`
- Modify: `src/app/(site)/join/career/page.tsx`
- Modify: `src/app/(site)/join/channel-partner/page.tsx`
- Modify: `src/app/(site)/join/supplier/page.tsx`
- Modify: `src/app/(site)/privacy-policy/page.tsx`
- Modify: `src/app/(site)/terms-and-conditions/page.tsx`
- Modify: `src/app/(site)/search/page.tsx`
- Create: `src/app/(site)/join/partner-sales-tools/partner-sales-tools-client.tsx`
- Modify: `src/app/(site)/join/partner-sales-tools/page.tsx`

**Interfaces:**
- Consumes: `getPageSeo`, `buildMetadata`, `SITE_METADATA_FALLBACK` from `@/lib/seo` (Task 2); `SeoJsonLd` from `@/components/seo/seo-json-ld` (Task 2).

This is one batched task covering 16 same-shape edits — each file gets exactly two additions: (1) a `generateMetadata` export using that file's key from the table below, (2) a `getPageSeo(key)` call in the page body whose result is passed to a `<SeoJsonLd schema={seo.schema} />` rendered as the first thing inside the page's existing root JSX element. **Read each file before editing it** — the exact `return` statement shape for each is summarized below (verified during planning), but match against the actual current file content since these are hand-written pages, not generated.

**Per-file key + wrap shape:**

| File | key | Current root return shape | Wrap action |
|---|---|---|---|
| `page.tsx` (home) | `home` | `<div className={...}>{sections...}</div>` | Insert `<SeoJsonLd .../>` as first child inside the `<div>` |
| `products/page.tsx` | `products` | `return (<ProductsPageClient ... />)` — bare component, no wrapper | Wrap in a Fragment |
| `downloads/page.tsx` | `downloads` | `<div><DownloadsHeroSection /><DownloadsSection .../></div>` | Insert as first child inside the `<div>` |
| `blogs/page.tsx` | `blogs` | `<div><BlogsHeroSection .../><ResourcesGridSection .../></div>` | Insert as first child inside the `<div>` |
| `case-studies/page.tsx` | `case-studies` | `<div><CaseStudiesHeroSection .../><ResourcesGridSection .../></div>` | Insert as first child inside the `<div>` |
| `news-updates/page.tsx` | `news-updates` | `<div><NewsUpdatesHeroSection .../><ResourcesGridSection .../></div>` | Insert as first child inside the `<div>` |
| `about/page.tsx` | `about` | `<>{hero?.enabled && (...)}...</>` — already a Fragment | Insert as first child inside the `<>` |
| `about/awards/page.tsx` | `about-awards` | `<div><AwardsHeroSection .../>...</div>` | Insert as first child inside the `<div>` |
| `contact/page.tsx` | `contact` | `<div>{hero?.enabled && (...)}...</div>` | Insert as first child inside the `<div>` |
| `join/career/page.tsx` | `join-career` | `<div>{hero?.enabled && (...)}...</div>` | Insert as first child inside the `<div>` |
| `join/channel-partner/page.tsx` | `join-channel-partner` | `<div>{hero?.enabled && (...)}...</div>` | Insert as first child inside the `<div>` |
| `join/supplier/page.tsx` | `join-supplier` | `<div>{hero?.enabled && (...)}...</div>` | Insert as first child inside the `<div>` |
| `privacy-policy/page.tsx` | `privacy-policy` | `return <LegalPageSection .../>;` — bare, no parens | Wrap in a Fragment |
| `terms-and-conditions/page.tsx` | `terms-and-conditions` | `return <LegalPageSection .../>;` — bare, no parens | Wrap in a Fragment |
| `search/page.tsx` | `search` | `return <SearchResultsClient .../>;` — bare, no parens | Wrap in a Fragment |
| `join/partner-sales-tools/page.tsx` | `join-partner-sales-tools` | `"use client"` component — **cannot** export `generateMetadata` | Special case, see Step 16 |

- [ ] **Step 1: Home page (`src/app/(site)/page.tsx`)**

Add imports (with the other imports at the top):
```ts
import type { Metadata } from "next";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";
```
Add, before the default export:
```ts
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getPageSeo("home"), SITE_METADATA_FALLBACK);
}
```
In the page component body, before the `return`, add:
```ts
  const seo = await getPageSeo("home");
```
Change the return statement — read the file to find the exact current line (`return (\n    <div className={heroIsFirst ? undefined : "pt-20 lg:pt-24"}>{sections.map((s) => s.node)}</div>\n  );`) and insert `<SeoJsonLd schema={seo.schema} />` as the first child inside that `<div>`, e.g.:
```tsx
  return (
    <div className={heroIsFirst ? undefined : "pt-20 lg:pt-24"}>
      <SeoJsonLd schema={seo.schema} />
      {sections.map((s) => s.node)}
    </div>
  );
```

- [ ] **Step 2: Products page (`src/app/(site)/products/page.tsx`)**

Add imports and `generateMetadata` as in Step 1, using key `"products"`.
In the component body before `return`, add `const seo = await getPageSeo("products");`.
Wrap the bare `<ProductsPageClient ... />` return in a Fragment with `SeoJsonLd` first:
```tsx
  return (
    <>
      <SeoJsonLd schema={seo.schema} />
      <ProductsPageClient
        products={products}
        categories={categories}
        {/* ...rest of existing props unchanged... */}
      />
    </>
  );
```

- [ ] **Step 3: Downloads page (`src/app/(site)/downloads/page.tsx`)**

Key `"downloads"`. Current body:
```tsx
  return (
    <div>
      <DownloadsHeroSection />
      <DownloadsSection items={items} industryOptions={industryOptions} />
    </div>
  );
```
Becomes:
```tsx
  return (
    <div>
      <SeoJsonLd schema={seo.schema} />
      <DownloadsHeroSection />
      <DownloadsSection items={items} industryOptions={industryOptions} />
    </div>
  );
```
(plus the same `generateMetadata` export, imports, and `const seo = await getPageSeo("downloads");` before `return`, as in Step 1.)

- [ ] **Step 4: Blogs page (`src/app/(site)/blogs/page.tsx`)**

Key `"blogs"`. Current body:
```tsx
  return (
    <div>
      <BlogsHeroSection featured={posts[0]} />
      <ResourcesGridSection heading="All Blogs" posts={posts} basePath="/blogs" />
    </div>
  );
```
Becomes:
```tsx
  return (
    <div>
      <SeoJsonLd schema={seo.schema} />
      <BlogsHeroSection featured={posts[0]} />
      <ResourcesGridSection heading="All Blogs" posts={posts} basePath="/blogs" />
    </div>
  );
```
(plus imports/`generateMetadata`/`const seo = await getPageSeo("blogs");` as above.)

- [ ] **Step 5: Case studies page (`src/app/(site)/case-studies/page.tsx`)**

Key `"case-studies"`. Same pattern as Step 4, current body:
```tsx
  return (
    <div>
      <CaseStudiesHeroSection featured={posts.slice(0, 2)} />
      <ResourcesGridSection heading="All Case Studies" posts={posts} basePath="/case-studies" />
    </div>
  );
```
Insert `<SeoJsonLd schema={seo.schema} />` as first child of the `<div>`.

- [ ] **Step 6: News & updates page (`src/app/(site)/news-updates/page.tsx`)**

Key `"news-updates"`. Same pattern, current body:
```tsx
  return (
    <div>
      <NewsUpdatesHeroSection highlighted={posts.slice(0, 4)} />
      <ResourcesGridSection heading="All News & Updates" posts={posts} basePath="/news-updates" />
    </div>
  );
```
Insert `<SeoJsonLd schema={seo.schema} />` as first child of the `<div>`.

- [ ] **Step 7: About page (`src/app/(site)/about/page.tsx`)**

Key `"about"`. This file's root is already a bare Fragment `<>...</>` (not a `<div>`). Read the file, find the opening `return (\n    <>` and insert `<SeoJsonLd schema={seo.schema} />` as the very first child inside it, before the existing `{hero?.enabled && (...)}`.

- [ ] **Step 8: Awards page (`src/app/(site)/about/awards/page.tsx`)**

Key `"about-awards"`. Current body starts:
```tsx
  return (
    <div>
      <AwardsHeroSection title={hero.title} description={hero.description} />
```
Insert `<SeoJsonLd schema={seo.schema} />` as first child, before `<AwardsHeroSection .../>`. Note this page already has an early `notFound()` guard above the `return` — put the `const seo = await getPageSeo("about-awards");` line after that guard (no point fetching SEO data for a 404).

- [ ] **Step 9: Contact page (`src/app/(site)/contact/page.tsx`)**

Key `"contact"`. Current body starts:
```tsx
  return (
    <div>
      {hero?.enabled && (
```
Insert `<SeoJsonLd schema={seo.schema} />` as first child, before the `{hero?.enabled && (...)}` block.

- [ ] **Step 10: Careers page (`src/app/(site)/join/career/page.tsx`)**

Key `"join-career"`. Same shape as Step 9 (`<div>{hero?.enabled && (...)}...`) — insert `<SeoJsonLd schema={seo.schema} />` as first child.

- [ ] **Step 11: Channel partner page (`src/app/(site)/join/channel-partner/page.tsx`)**

Key `"join-channel-partner"`. Same shape — insert `<SeoJsonLd schema={seo.schema} />` as first child.

- [ ] **Step 12: Supplier page (`src/app/(site)/join/supplier/page.tsx`)**

Key `"join-supplier"`. Same shape — insert `<SeoJsonLd schema={seo.schema} />` as first child.

- [ ] **Step 13: Privacy policy page (`src/app/(site)/privacy-policy/page.tsx`)**

Key `"privacy-policy"`. Current file:
```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LegalPageSection } from "@/components/sections/legal-page-section";

export default async function PrivacyPolicyPage() {
  const page = await prisma.legalPage.findUnique({ where: { key: "privacy" } });
  if (!page) notFound();

  return <LegalPageSection title={page.title} content={page.content} />;
}
```
Replace with:
```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { LegalPageSection } from "@/components/sections/legal-page-section";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getPageSeo("privacy-policy"), SITE_METADATA_FALLBACK);
}

export default async function PrivacyPolicyPage() {
  const page = await prisma.legalPage.findUnique({ where: { key: "privacy" } });
  if (!page) notFound();

  const seo = await getPageSeo("privacy-policy");

  return (
    <>
      <SeoJsonLd schema={seo.schema} />
      <LegalPageSection title={page.title} content={page.content} />
    </>
  );
}
```

- [ ] **Step 14: Terms & conditions page (`src/app/(site)/terms-and-conditions/page.tsx`)**

Key `"terms-and-conditions"`. Identical pattern to Step 13, replacing `prisma.legalPage.findUnique({ where: { key: "terms" } })`'s surrounding function — apply the same transformation with key `"terms-and-conditions"` (this is the one file in this batch given verbatim in full since its current content is fully known and identical in shape to Step 13):
```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { LegalPageSection } from "@/components/sections/legal-page-section";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getPageSeo("terms-and-conditions"), SITE_METADATA_FALLBACK);
}

export default async function TermsAndConditionsPage() {
  const page = await prisma.legalPage.findUnique({ where: { key: "terms" } });
  if (!page) notFound();

  const seo = await getPageSeo("terms-and-conditions");

  return (
    <>
      <SeoJsonLd schema={seo.schema} />
      <LegalPageSection title={page.title} content={page.content} />
    </>
  );
}
```

- [ ] **Step 15: Search page (`src/app/(site)/search/page.tsx`)**

Key `"search"`. Current file:
```tsx
import { SearchResultsClient } from "./search-results-client";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <SearchResultsClient q={q ?? ""} />;
}
```
Replace with:
```tsx
import type { Metadata } from "next";
import { SearchResultsClient } from "./search-results-client";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getPageSeo("search"), SITE_METADATA_FALLBACK);
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const seo = await getPageSeo("search");

  return (
    <>
      <SeoJsonLd schema={seo.schema} />
      <SearchResultsClient q={q ?? ""} />
    </>
  );
}
```
(`search`'s SEO row defaults to `noindex: true` per `src/lib/seo.ts`'s `defaultSeoMeta` — no extra code needed here for that, it's already handled by `getPageSeo`'s default.)

- [ ] **Step 16: Partner sales tools page — client component conversion**

`src/app/(site)/join/partner-sales-tools/page.tsx` is currently `"use client"`, which cannot export `generateMetadata` (server-only API). Split it: move the existing client logic into a new file, make `page.tsx` a thin async server component.

Create `src/app/(site)/join/partner-sales-tools/partner-sales-tools-client.tsx`:
```tsx
"use client";
import { useState } from "react";
import { PartnerToolsLogin } from "@/components/sections/partner-tools-login";
import { PartnerToolsGrid } from "@/components/sections/partner-tools-grid";

export function PartnerSalesToolsClient() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) return <PartnerToolsLogin onUnlock={() => setUnlocked(true)} />;
  return <PartnerToolsGrid />;
}
```

Replace `src/app/(site)/join/partner-sales-tools/page.tsx` entirely with:
```tsx
import type { Metadata } from "next";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";
import { PartnerSalesToolsClient } from "./partner-sales-tools-client";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getPageSeo("join-partner-sales-tools"), SITE_METADATA_FALLBACK);
}

export default async function PartnerSalesToolsPage() {
  const seo = await getPageSeo("join-partner-sales-tools");

  return (
    <>
      <SeoJsonLd schema={seo.schema} />
      <PartnerSalesToolsClient />
    </>
  );
}
```

- [ ] **Step 17: Verify**

Run: `npx tsc --noEmit -p .` — expect no new errors across all 16 files.

Run the dev server, then for a representative sample (not necessarily all 16 — pick home, one resource-listing page, one `<>`-rooted page, the two legal pages, search, and partner-sales-tools since it's the structurally different one):
```bash
curl -s http://localhost:3000/ | grep -o '<title>[^<]*</title>'
curl -s http://localhost:3000/blogs | grep -o '<title>[^<]*</title>'
curl -s http://localhost:3000/privacy-policy | grep -o '<title>[^<]*</title>'
curl -s http://localhost:3000/search | grep -o 'name="robots"[^>]*'
curl -sI http://localhost:3000/join/partner-sales-tools | head -1
```
Confirm each returns a `<title>` tag (falling back to the site-wide default since no admin edits have been made yet in this task's verification pass — Task 3's own verification already confirmed the admin-edited case for `home`), `/search` shows `noindex` in its robots meta, and `/join/partner-sales-tools` still returns `200` and renders correctly (the login gate should still work — this only restructured the file, not the login logic).

- [ ] **Step 18: Commit**

```bash
git add "src/app/(site)"
git commit -m "feat: wire generateMetadata and JSON-LD into all 16 static pages"
```

---

### Task 6: Final end-to-end verification

**Files:** none (verification only).

- [ ] **Step 1: Full manual pass**

Run the dev server. Walk the whole flow:
1. `/admin/seo` → click a page → fill in Title, Description, 2 keywords, OG image, canonical URL, toggle Noindex on, paste `{"@context":"https://schema.org","@type":"Organization","name":"Rotex"}` into Schema → Save → confirm "Saved.".
2. `curl -s http://localhost:3000/<that page's path>` and grep for: the new `<title>`, `<meta name="description"`, `<meta name="keywords"`, `<link rel="canonical"`, `<meta name="robots" content="noindex`, and `<script type="application/ld+json">` containing `"Rotex"`.
3. Try saving invalid JSON in the Schema field again — confirm the inline error still blocks the save (didn't regress from Task 3's own check).
4. Confirm `/admin/global/header`'s favicon field persists and `/`'s `<link rel="icon">` reflects it (re-verify Task 4's check still holds after all later edits).
5. Confirm `/admin/home` no longer shows an "Edit SEO" button and `/admin/home/seo` now 404s.
6. Spot-check 2-3 more of the 16 public pages return `200` and render normally (no visual regression from the `SeoJsonLd`/Fragment insertions).

- [ ] **Step 2: Report status**

Summarize what was verified. Known deliberate limitations to state, not silently: no test framework (manual verification only, matches project convention); per-record dynamic SEO (Product/Resource/Industry/etc.) is out of scope, a follow-up phase; `sitemap.xml`/`robots.txt` not addressed, flagged earlier as a related but separate gap.
