# Legal Pages (Privacy Policy & Terms and Conditions) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two admin-editable legal pages (Privacy Policy, Terms & Conditions) with a TinyMCE rich-text editor, render them publicly at `/privacy-policy` and `/terms-and-conditions`, wire the existing (currently dead) footer links to them, and seed dummy placeholder content.

**Architecture:** New `LegalPage` Prisma model (`key`/`title`/`content`, section-keyed like `HomeSection` but without `order` — two fixed pages, not a reorderable list). Admin gets a two-item index page + a `[key]` edit screen using a newly-extracted `RichTextField` (the TinyMCE setup already proven in `resource-edit-form.tsx`, pulled out so it isn't duplicated). Public pages are thin server components that query Prisma directly (same shape as `resource-detail-page.tsx`) and render sanitized HTML through a shared prose CSS module extracted from `post-detail-section.module.css`. Footer link hrefs get updated (seed + existing dev DB row) and the routes are removed from the "disabled" list.

**Tech Stack:** Next.js App Router, React, TypeScript, react-hook-form, Prisma (SQLite), `@tinymce/tinymce-react` + `tinymce` (already installed), `isomorphic-dompurify` (already installed). No test runner in this repo — verification is `tsc --noEmit` + `next build` + manual browser check (Playwright script optional per task; this plan includes one but keep it light).

## Global Constraints

- `LegalPage.key` is one of exactly two fixed values: `"privacy"`, `"terms"`. No create/delete UI, no generic slug system.
- No `enabled` field on `LegalPage` — always-on once seeded.
- Public routes are `/privacy-policy` and `/terms-and-conditions` (explicit, not the currently-reserved `/privacy`/`/terms`).
- `resource-edit-form.tsx` must keep working unchanged — the TinyMCE extraction is additive, not a refactor of that file.
- `post-detail-section.tsx` visual output must not change — the CSS module move must be a pure relocation.

---

### Task 1: `LegalPage` Prisma model + migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: migration under `prisma/migrations/` (auto-named by Prisma CLI)

**Interfaces:**
- Produces: `prisma.legalPage` client accessor with fields `key: string`, `title: string`, `content: string`, `updatedAt: Date`.

- [ ] **Step 1: Add the model**

Add near the other section-keyed models (after `ContactSection`, `prisma/schema.prisma` around line 220):

```prisma
model LegalPage {
  key       String   @id
  title     String
  content   String
  updatedAt DateTime @updatedAt
}
```

- [ ] **Step 2: Run the migration**

Run: `npx prisma migrate dev --name add_legal_page_model`
Expected: creates `prisma/migrations/<timestamp>_add_legal_page_model/migration.sql` containing a `CREATE TABLE "LegalPage"` statement, applies it to `dev.db`, and regenerates the Prisma client (`src/generated/prisma`).

- [ ] **Step 3: Verify the client**

Run: `grep -r "LegalPage" src/generated/prisma/models/ | head -3`
Expected: a `LegalPage.ts` model file exists.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: add LegalPage model for privacy policy and terms pages"
```

---

### Task 2: Extract shared `RichTextField` (TinyMCE) component

**Files:**
- Create: `src/components/admin/rich-text-field.tsx`

**Interfaces:**
- Produces:
  ```ts
  function RichTextField({
    name,
    label,
  }: {
    name: string;   // react-hook-form field path, e.g. "content"
    label: string;
  }): JSX.Element
  ```
  Must be used inside a react-hook-form `FormProvider` (reads/writes via `useFormContext`).
- Consumes: `Field` from `@/components/admin/form-fields`, `Editor` from `@tinymce/tinymce-react`, `marked` from `marked`, `useTheme` from `next-themes`. Reuses the existing `./tinymce-theme.css` from the resources admin folder (import its relative path from the new location: `@/components/admin/resources/tinymce-theme.css`).

- [ ] **Step 1: Write the component**

This is `ContentField` from `src/components/admin/resources/resource-edit-form.tsx:155-244`, generalized to take a field `name`/`label` instead of the hardcoded `"content"` field:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTheme } from "next-themes";
import { Editor } from "@tinymce/tinymce-react";
import { marked } from "marked";
import "@/components/admin/resources/tinymce-theme.css";
import { Field } from "@/components/admin/form-fields";

function looksLikeHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

export function RichTextField({ name, label }: { name: string; label: string }) {
  const form = useFormContext();
  const raw = form.getValues(name) as string;
  const initialValue = raw && !looksLikeHtml(raw) ? (marked.parse(raw, { async: false }) as string) : raw;
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Field label={label}>
        <div className="h-160 rounded-md border bg-muted animate-pulse" />
      </Field>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Field label={label}>
      <Editor
        id={`${name}-editor`}
        key={isDark ? "dark" : "light"}
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        initialValue={initialValue}
        onEditorChange={(value) => form.setValue(name, value, { shouldDirty: true })}
        init={{
          height: 640,
          menubar: true,
          promotion: false,
          toolbar_mode: "wrap",
          skin: isDark ? "oxide-dark" : "oxide",
          content_css: isDark ? "dark" : "default",
          content_style: isDark
            ? "body { background-color: #2a2525; color: #ffffff; font-family: inherit; }"
            : "body { background-color: #ffffff; color: #201d1d; font-family: inherit; }",
          plugins: [
            "advlist", "autolink", "lists", "link", "image", "charmap", "preview", "anchor",
            "searchreplace", "visualblocks", "visualchars", "fullscreen", "insertdatetime",
            "media", "table", "code", "help", "wordcount", "emoticons", "nonbreaking",
            "pagebreak", "directionality", "quickbars",
          ],
          toolbar:
            "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | " +
            "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | " +
            "link image media table | blockquote hr removeformat | charmap emoticons insertdatetime | " +
            "anchor searchreplace visualblocks | fullscreen preview code | help",
          block_formats:
            "Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Preformatted=pre; Blockquote=blockquote",
          images_upload_handler: async (blobInfo) => {
            const formData = new FormData();
            formData.append("file", blobInfo.blob(), blobInfo.filename());
            const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
            const json = await res.json();
            if (!json.success) throw new Error(json.error?.message ?? "Upload failed");
            return json.data.url as string;
          },
        }}
      />
    </Field>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in `rich-text-field.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/rich-text-field.tsx
git commit -m "feat: extract shared RichTextField (TinyMCE) component"
```

---

### Task 3: Admin actions, index page, and edit form

**Files:**
- Create: `src/app/admin/(dashboard)/legal/actions.ts`
- Create: `src/app/admin/(dashboard)/legal/page.tsx`
- Create: `src/app/admin/(dashboard)/legal/[key]/page.tsx`
- Create: `src/components/admin/legal/legal-page-form.tsx`
- Modify: `src/components/admin/sidebar.tsx`

**Interfaces:**
- Consumes: `RichTextField` from Task 2 (`@/components/admin/rich-text-field`), `SaveBar` from `@/components/admin/section-form-shell`, `TextField` from `@/components/admin/form-fields`, `useSaveAction` from `@/hooks/use-save-action`, `prisma.legalPage` from Task 1.
- Produces:
  ```ts
  // actions.ts
  function saveLegalPage(key: string, data: { title: string; content: string }): Promise<void>
  ```

- [ ] **Step 1: Write the server actions**

`src/app/admin/(dashboard)/legal/actions.ts`:
```ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const PUBLIC_PATH: Record<string, string> = {
  privacy: "/privacy-policy",
  terms: "/terms-and-conditions",
};

export async function saveLegalPage(key: string, data: { title: string; content: string }) {
  await prisma.legalPage.update({ where: { key }, data });

  revalidatePath("/admin/legal");
  revalidatePath(`/admin/legal/${key}`);
  if (PUBLIC_PATH[key]) revalidatePath(PUBLIC_PATH[key]);
}
```

- [ ] **Step 2: Write the admin index page**

`src/app/admin/(dashboard)/legal/page.tsx`:
```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";

const PAGES = [
  { key: "privacy", label: "Privacy Policy" },
  { key: "terms", label: "Terms & Conditions" },
];

export default async function AdminLegalPage() {
  const rows = await prisma.legalPage.findMany();
  const byKey = new Map(rows.map((r) => [r.key, r]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Legal Pages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit the Privacy Policy and Terms & Conditions shown on the public site.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PAGES.map((p) => {
          const row = byKey.get(p.key);
          return (
            <Link key={p.key} href={`/admin/legal/${p.key}`}>
              <Card className="transition-colors hover:border-primary">
                <CardContent className="p-4">
                  <p className="font-medium">{row?.title ?? p.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Last updated {row ? new Date(row.updatedAt).toLocaleDateString() : "never"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write the edit page**

`src/app/admin/(dashboard)/legal/[key]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { LegalPageForm } from "@/components/admin/legal/legal-page-form";

const VALID_KEYS = new Set(["privacy", "terms"]);
const LABELS: Record<string, string> = { privacy: "Privacy Policy", terms: "Terms & Conditions" };

export default async function AdminLegalPageEdit({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  if (!VALID_KEYS.has(key)) notFound();

  const page = await prisma.legalPage.findUnique({ where: { key } });
  const label = LABELS[key];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edit this legal page.</p>
        </div>
        <Breadcrumb items={[{ label: "Legal Pages", href: "/admin/legal" }, { label }]} />
      </div>

      <LegalPageForm pageKey={key} initialTitle={page?.title ?? label} initialContent={page?.content ?? ""} />
    </div>
  );
}
```

- [ ] **Step 4: Write the form**

`src/components/admin/legal/legal-page-form.tsx`:
```tsx
"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { TextField } from "@/components/admin/form-fields";
import { RichTextField } from "@/components/admin/rich-text-field";
import { SaveBar } from "@/components/admin/section-form-shell";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveLegalPage } from "@/app/admin/(dashboard)/legal/actions";

type FormValues = { title: string; content: string };

export function LegalPageForm({
  pageKey,
  initialTitle,
  initialContent,
}: {
  pageKey: string;
  initialTitle: string;
  initialContent: string;
}) {
  const form = useForm<FormValues>({ defaultValues: { title: initialTitle, content: initialContent } });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    run(async () => {
      try {
        await saveLegalPage(pageKey, values);
        toast.success("Legal page saved");
      } catch (err) {
        toast.error("Failed to save legal page");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TextField label="Title" {...form.register("title", { required: true })} />
        <RichTextField name="content" label="Content" />
        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
```

- [ ] **Step 5: Add the sidebar nav entry**

In `src/components/admin/sidebar.tsx`, add `Shield` to the `lucide-react` import list (alongside `Wrench` on the existing import block), and add this line to `PAGE_ITEMS` (after the `"/admin/partner-sales-tools"` entry, `sidebar.tsx:41`):
```ts
  { href: "/admin/legal", label: "Legal Pages", icon: Shield },
```

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in the new/modified files (Prisma types for `legalPage` resolve because Task 1 already regenerated the client).

- [ ] **Step 7: Commit**

```bash
git add "src/app/admin/(dashboard)/legal" src/components/admin/legal src/components/admin/sidebar.tsx
git commit -m "feat: add admin Legal Pages screens (index, edit form, nav entry)"
```

---

### Task 4: Public pages + shared prose styling

**Files:**
- Create: `src/components/sections/rich-content.module.css` (move content from `post-detail-section.module.css`)
- Modify: `src/components/sections/post-detail-section.tsx` (swap CSS import only)
- Delete: `src/components/sections/post-detail-section.module.css`
- Create: `src/components/sections/legal-page-section.tsx`
- Create: `src/app/(site)/privacy-policy/page.tsx`
- Create: `src/app/(site)/terms-and-conditions/page.tsx`

**Interfaces:**
- Produces: `LegalPageSection({ title, content }: { title: string; content: string })` — sanitizes and renders `content` as HTML.

- [ ] **Step 1: Move the CSS module**

```bash
git mv "src/components/sections/post-detail-section.module.css" "src/components/sections/rich-content.module.css"
```

- [ ] **Step 2: Update the import in `post-detail-section.tsx`**

In `src/components/sections/post-detail-section.tsx:7`, replace:
```ts
import styles from "./post-detail-section.module.css";
```
with:
```ts
import styles from "./rich-content.module.css";
```
(No other change — the `styles.content` class name is unchanged.)

- [ ] **Step 3: Typecheck + confirm the resource pages still work**

Run: `npx tsc --noEmit`
Expected: no errors. (Full visual confirmation happens in Task 6's manual check, alongside the new pages.)

- [ ] **Step 4: Write the shared public section**

`src/components/sections/legal-page-section.tsx`:
```tsx
import DOMPurify from "isomorphic-dompurify";
import { PageHero } from "@/components/ui/page-hero";
import styles from "./rich-content.module.css";

export function LegalPageSection({ title, content }: { title: string; content: string }) {
  const contentHtml = DOMPurify.sanitize(content, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "target"],
  });

  return (
    <>
      <PageHero title={title} />
      <section className="py-16">
        <div className="container">
          <div className={styles.content} dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 5: Write the two public pages**

`src/app/(site)/privacy-policy/page.tsx`:
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

`src/app/(site)/terms-and-conditions/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LegalPageSection } from "@/components/sections/legal-page-section";

export default async function TermsAndConditionsPage() {
  const page = await prisma.legalPage.findUnique({ where: { key: "terms" } });
  if (!page) notFound();

  return <LegalPageSection title={page.title} content={page.content} />;
}
```

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add "src/components/sections/rich-content.module.css" "src/components/sections/post-detail-section.module.css" src/components/sections/post-detail-section.tsx src/components/sections/legal-page-section.tsx "src/app/(site)/privacy-policy" "src/app/(site)/terms-and-conditions"
git commit -m "feat: add public privacy policy and terms & conditions pages"
```

---

### Task 5: Wire the footer to the new routes

**Files:**
- Modify: `src/components/layout/footer.tsx`
- Modify: `prisma/seed-home.ts`

**Interfaces:** none new — this updates existing data/config only.

- [ ] **Step 1: Drop the old reserved routes from the disabled set**

In `src/components/layout/footer.tsx:10`, replace:
```ts
const DISABLED_HREFS = new Set(["/privacy", "/terms"]);
```
with:
```ts
const DISABLED_HREFS = new Set<string>([]);
```
(Keep the constant and the lookup logic in `footer.tsx:163-177` as-is — it's the general mechanism for any future not-yet-built page; it's just empty now that both entries are live.)

- [ ] **Step 2: Update the seed default hrefs/labels for fresh installs**

In `prisma/seed-home.ts`, around line 210-213, replace:
```ts
    legal: {
      copyright: "© 2026 Rotex. All rights reserved.",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Use", href: "/terms" },
      ],
    },
```
with:
```ts
    legal: {
      copyright: "© 2026 Rotex. All rights reserved.",
      links: [
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms & Conditions", href: "/terms-and-conditions" },
      ],
    },
```

- [ ] **Step 3: Update the existing dev database row (this repo's `dev.db` was already seeded with the old hrefs — the seed file change alone won't touch it)**

This project's one-off scripts are standalone `tsx` scripts using the `PrismaBetterSqlite3` adapter directly (see `prisma/seed-awards.ts:1-7` for the exact shape) — not the generic `PrismaClient` import used elsewhere. Create a temporary script `prisma/fix-footer-legal-links.ts`:

```ts
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!.replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const row = await prisma.globalConfig.findUnique({ where: { id: "global" } });
  if (!row) {
    console.log("no global config row found, skipping");
    return;
  }
  const data = row.data as PrismaJson.GlobalConfigData;
  data.footer.legal.links = [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
  ];
  await prisma.globalConfig.update({ where: { id: "global" }, data: { data: data as never } });
  console.log("updated footer legal links");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

Run: `npx tsx prisma/fix-footer-legal-links.ts`
Expected: prints `updated footer legal links`. Then delete the script — it's a one-time data fix, not a reusable seed:
```bash
rm prisma/fix-footer-legal-links.ts
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/footer.tsx prisma/seed-home.ts
git commit -m "feat: point footer legal links at the new privacy/terms pages"
```

---

### Task 6: Seed dummy legal content

**Files:**
- Create: `prisma/seed-legal.ts`

**Interfaces:** none new — standalone script, matches the existing `prisma/seed-awards.ts` convention (each domain has its own standalone one-off seed script with its own `PrismaClient`; none of them are wired into `seed.ts`'s automatic chain — `seed.ts` only runs `seed-content.ts`, which restores a separate real-content JSON snapshot).

- [ ] **Step 1: Write the seed script**

`prisma/seed-legal.ts` (same shape as `prisma/seed-awards.ts:1-7`):

```ts
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!.replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

const PRIVACY_CONTENT = `
<h2>1. Information We Collect</h2>
<p>This is placeholder content. Rotex collects information you provide directly to us, such as your name, email address, and company details when you contact us or request a quote.</p>
<h2>2. How We Use Your Information</h2>
<p>This is placeholder content. We use the information we collect to respond to inquiries, provide our products and services, and improve our website.</p>
<h2>3. Data Sharing</h2>
<p>This is placeholder content. We do not sell your personal information. We may share it with trusted partners who help us operate our business, under confidentiality agreements.</p>
<h2>4. Your Rights</h2>
<p>This is placeholder content. You may request access to, correction of, or deletion of your personal data at any time by contacting us.</p>
<h2>5. Contact Us</h2>
<p>This is placeholder content. Replace this page with your organization's actual privacy policy before going live.</p>
`.trim();

const TERMS_CONTENT = `
<h2>1. Acceptance of Terms</h2>
<p>This is placeholder content. By accessing and using this website, you accept and agree to be bound by these Terms &amp; Conditions.</p>
<h2>2. Use of Service</h2>
<p>This is placeholder content. This website and its content are provided for informational purposes about Rotex's products and services.</p>
<h2>3. Intellectual Property</h2>
<p>This is placeholder content. All content on this site, including text, graphics, and logos, is the property of Rotex unless otherwise noted.</p>
<h2>4. Limitation of Liability</h2>
<p>This is placeholder content. Rotex is not liable for any damages arising from the use of this website or reliance on its content.</p>
<h2>5. Changes to Terms</h2>
<p>This is placeholder content. Replace this page with your organization's actual terms and conditions before going live.</p>
`.trim();

async function main() {
  await prisma.legalPage.upsert({
    where: { key: "privacy" },
    update: {},
    create: { key: "privacy", title: "Privacy Policy", content: PRIVACY_CONTENT },
  });
  await prisma.legalPage.upsert({
    where: { key: "terms" },
    update: {},
    create: { key: "terms", title: "Terms & Conditions", content: TERMS_CONTENT },
  });
  console.log("Seeded LegalPage rows: privacy, terms");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

`upsert` with an empty `update: {}` means re-running this script later (e.g. on a fresh deploy) won't clobber content an admin has already edited — it only fills in the row if missing.

- [ ] **Step 2: Run the script**

Run: `npx tsx prisma/seed-legal.ts`
Expected: prints `Seeded LegalPage rows: privacy, terms`, no errors.

- [ ] **Step 3: Verify the rows exist**

Run: `npx tsx -e 'import { PrismaClient } from "./src/generated/prisma/client"; import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"; const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL!.replace(/^file:/, "") }); const prisma = new PrismaClient({ adapter }); prisma.legalPage.findMany().then((rows) => { console.log(rows); return prisma.$disconnect(); });'`
Expected: two rows printed, `key: "privacy"` and `key: "terms"`, each with non-empty `content`.

- [ ] **Step 4: Commit**

```bash
git add prisma/seed-legal.ts
git commit -m "feat: seed dummy privacy policy and terms & conditions content"
```

---

### Task 7: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Full typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: succeeds; `/privacy-policy` and `/terms-and-conditions` appear in the route list output.

- [ ] **Step 3: Manual check (dev server)**

Start `npm run dev` if not already running, then in a browser (or a lightweight Playwright script if preferred — not required, the user has said they'll check manually):
- Visit `/admin/legal` — confirm two cards, "Privacy Policy" and "Terms & Conditions".
- Open each, confirm the TinyMCE editor loads with the seeded placeholder content, edit the title, save, confirm the "Legal page saved" toast.
- Visit `/privacy-policy` and `/terms-and-conditions` directly — confirm the seeded headings/paragraphs render.
- Visit `/` (or any page with the footer) — confirm "Privacy Policy" and "Terms & Conditions" are now clickable links (not disabled gray text) and navigate to the right pages.
