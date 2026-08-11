# Split Certifications out of Partner Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give certification-body logos (CE, EX, SIL3, IATF, inmetro, ISI, KOSHA, PCT, PED, UL) their own `Certification` model and admin CRUD, instead of living mixed into the `Partner` table.

**Architecture:** Add a `Certification` Prisma model identical in shape to `Partner`. Add admin CRUD pages/actions/components that mirror the existing Partners feature exactly. Migrate the 10 existing certification rows out of `Partner` into `Certification` via a one-off script driven by the `certifications` HomeSection's current `partnerIds`. Update the home-section editor and `getHomeSection()` to read certifications from the new table. Public-facing output shape is unchanged, so the home page and its API route need no changes.

**Tech Stack:** Next.js 16 App Router, Prisma 7 + better-sqlite3 adapter, React Hook Form, react-hook-form + Zod-free plain form fields (existing `@/components/admin/form-fields`), `tsx` for one-off scripts (already used by `prisma/seed.ts`).

## Global Constraints
- DB in use at runtime is the **root** `dev.db` (via `DATABASE_URL="file:./dev.db"` resolved from repo root by `src/lib/prisma.ts`), NOT `prisma/dev.db` (a stale unrelated file). All scripts/migrations in this plan must go through `@/lib/prisma` or `npx prisma migrate dev` (which also targets `DATABASE_URL`) — never touch `prisma/dev.db` directly.
- No test framework configured in this repo — verification uses `npx tsc --noEmit`, `npm run build`, and manual browser checks (dev server on port 5007, `npm run dev`).
- Certification model fields: exactly `id, name, logo, published, createdAt, updatedAt` — same shape as `Partner`, no extra fields (year/issuing-body/etc. explicitly out of scope per spec).
- The 10 rows to migrate, identified by name in the live `Partner` table: CE, EX, SIL3, IATF, inmetro, ISI, KOSHA, PCT, PED, UL — reachable via `HomeSection.findUnique({ where: { key: "certifications" } }).data.partnerIds`, not by hardcoded IDs (IDs are cuids, already known to be `cmsehywiy00003xknxgbt37kw` etc., but the script must read them live, not hardcode, since cuids in other environments will differ).

---

## File Structure

- Modify `prisma/schema.prisma` — add `Certification` model.
- Create migration via `npx prisma migrate dev --name add_certification_model`.
- Create `src/lib/certifications.ts` — `getSelectedCertifications`, `getPublishedCertifications`, mirrors `src/lib/partners.ts`.
- Modify `src/lib/home-section.ts` — split the combined partners/certifications branch.
- Create `scripts/migrate-certifications-from-partners.ts` — one-off data migration.
- Create `src/app/admin/(dashboard)/certifications/page.tsx`, `actions.ts` — mirrors `partners/`.
- Create `src/components/admin/certifications/certification-list.tsx`, `certification-form-dialog.tsx` — mirrors `src/components/admin/partners/`.
- Modify `src/components/admin/home-sections/certifications-picker-form.tsx` — rename `allPartners`→`allCertifications`, `partnerIds`→`certificationIds`.
- Modify `src/app/admin/(dashboard)/home/[key]/page.tsx` — split the combined query, pass `allCertifications`.
- Modify `src/components/admin/sidebar.tsx` — add "Certifications" nav entry.
- Modify `prisma/seed-home.ts` — add `CERTIFICATIONS` array + seeding loop, switch the `certifications` section to `certificationIds`.

---

### Task 1: Add `Certification` model and migrate schema

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: Prisma model `Certification { id: String, name: String, logo: String, published: Boolean, createdAt: DateTime, updatedAt: DateTime }`, accessible at runtime as `prisma.certification` (camelCased delegate name, Prisma's standard convention — confirm by checking `prisma.partner` is the delegate name for model `Partner` in the generated client, which it is).

- [ ] **Step 1: Add the model**

In `prisma/schema.prisma`, right after the closing `}` of the `Partner` model (currently lines 126-133), add:

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

- [ ] **Step 2: Generate and apply the migration**

```bash
npx prisma migrate dev --name add_certification_model
```

Expected: prompts nothing destructive (pure additive `CREATE TABLE`), prints `Your database is now in sync with your schema.` and regenerates the Prisma client.

- [ ] **Step 3: Verify the table exists in the live DB**

```bash
sqlite3 dev.db ".schema Certification"
```

Expected: prints the `CREATE TABLE "Certification" (...)` statement with columns `id, name, logo, published, createdAt, updatedAt`.

- [ ] **Step 4: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep -v "validator.ts"
```

Expected: no output (the `.next/types/validator.ts` categories-route errors are pre-existing and unrelated — ignore them).

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: add Certification model, separate from Partner"
```

---

### Task 2: Add `src/lib/certifications.ts` and wire `getHomeSection`

**Files:**
- Create: `src/lib/certifications.ts`
- Modify: `src/lib/home-section.ts`

**Interfaces:**
- Consumes: `prisma.certification` (Task 1).
- Produces: `getSelectedCertifications(ids: string[]): Promise<Certification[]>`, `getPublishedCertifications(): Promise<Certification[]>` — consumed by Task 4's admin page and by `getHomeSection` in this task.

- [ ] **Step 1: Create the lib file**

Create `src/lib/certifications.ts`, mirroring `src/lib/partners.ts` exactly:

```ts
import { prisma } from "@/lib/prisma";

export async function getSelectedCertifications(ids: string[]) {
  if (ids.length === 0) return [];

  return prisma.certification.findMany({
    where: { id: { in: ids }, published: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getPublishedCertifications() {
  return prisma.certification.findMany({
    where: { published: true },
    orderBy: { createdAt: "asc" },
  });
}
```

- [ ] **Step 2: Split the `getHomeSection` branch**

In `src/lib/home-section.ts`, replace:

```ts
import { getSelectedPartners } from "@/lib/partners";
```

with:

```ts
import { getSelectedPartners } from "@/lib/partners";
import { getSelectedCertifications } from "@/lib/certifications";
```

Then replace this block:

```ts
  if (key === "partners" || key === "certifications") {
    const partners = await getSelectedPartners((data.partnerIds as string[]) ?? []);
    const logos = partners.map((p) => ({ id: p.id, src: p.logo, alt: p.name }));
    return apiSuccess(
      { enabled: section.enabled, title: data.title, description: data.description, logos },
      section.updatedAt
    );
  }
```

with:

```ts
  if (key === "partners") {
    const partners = await getSelectedPartners((data.partnerIds as string[]) ?? []);
    const logos = partners.map((p) => ({ id: p.id, src: p.logo, alt: p.name }));
    return apiSuccess(
      { enabled: section.enabled, title: data.title, description: data.description, logos },
      section.updatedAt
    );
  }

  if (key === "certifications") {
    const certifications = await getSelectedCertifications((data.certificationIds as string[]) ?? []);
    const logos = certifications.map((c) => ({ id: c.id, src: c.logo, alt: c.name }));
    return apiSuccess(
      { enabled: section.enabled, title: data.title, description: data.description, logos },
      section.updatedAt
    );
  }
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep -v "validator.ts"
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/lib/certifications.ts src/lib/home-section.ts
git commit -m "feat: read certifications home section from Certification model"
```

---

### Task 3: One-off data migration script

**Files:**
- Create: `scripts/migrate-certifications-from-partners.ts`

**Interfaces:**
- Consumes: `prisma.certification.create`, `prisma.partner.findUnique`/`delete`, `prisma.homeSection.findUnique`/`update` (Task 1, existing).
- Produces: live-DB side effect only — no code interface consumed by later tasks, but Task 6/8's manual verification depends on this having run (Partner table has only 18 rows, Certification table has 10, HomeSection `certifications` uses `certificationIds`).

- [ ] **Step 1: Write the script**

Create `scripts/migrate-certifications-from-partners.ts`:

```ts
import { prisma } from "../src/lib/prisma";

async function main() {
  const section = await prisma.homeSection.findUnique({ where: { key: "certifications" } });
  if (!section) throw new Error('HomeSection "certifications" not found');

  const data = section.data as { title?: string; description?: string; partnerIds?: string[] };
  const ids = data.partnerIds ?? [];

  if (ids.length === 0) {
    console.log("No partnerIds on the certifications section — nothing to migrate.");
    return;
  }

  console.log(`Migrating ${ids.length} rows from Partner to Certification...`);

  for (const id of ids) {
    const partner = await prisma.partner.findUnique({ where: { id } });
    if (!partner) {
      console.warn(`  skip ${id}: not found in Partner`);
      continue;
    }
    await prisma.certification.create({
      data: {
        id: partner.id,
        name: partner.name,
        logo: partner.logo,
        published: partner.published,
      },
    });
    await prisma.partner.delete({ where: { id } });
    console.log(`  moved "${partner.name}" (${id})`);
  }

  await prisma.homeSection.update({
    where: { key: "certifications" },
    data: {
      data: {
        title: data.title,
        description: data.description,
        certificationIds: ids,
      },
    },
  });

  console.log("Updated certifications HomeSection to use certificationIds.");
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
```

- [ ] **Step 2: Run it once**

```bash
npx tsx scripts/migrate-certifications-from-partners.ts
```

Expected output: `Migrating 10 rows from Partner to Certification...` followed by 10 `moved "..." (...)` lines (CE, EX, SIL3, IATF, inmetro, ISI, KOSHA, PCT, PED, UL), then `Updated certifications HomeSection to use certificationIds.` and `Done.`

- [ ] **Step 3: Verify the live DB**

```bash
sqlite3 dev.db "SELECT count(*) FROM Partner;"
sqlite3 dev.db "SELECT name FROM Certification ORDER BY createdAt;"
sqlite3 dev.db "SELECT data FROM HomeSection WHERE key='certifications';"
```

Expected: `Partner` count is `18`. `Certification` lists exactly `CE, EX, SIL3, IATF, inmetro, ISI, KOSHA, PCT, PED, UL`. The `HomeSection` row's JSON has `certificationIds` (not `partnerIds`) with the same 10 ids.

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate-certifications-from-partners.ts
git commit -m "chore: add one-off script to move certifications out of Partner table"
```

---

### Task 4: Admin CRUD for Certifications (page, actions, list, dialog)

**Files:**
- Create: `src/app/admin/(dashboard)/certifications/page.tsx`
- Create: `src/app/admin/(dashboard)/certifications/actions.ts`
- Create: `src/components/admin/certifications/certification-list.tsx`
- Create: `src/components/admin/certifications/certification-form-dialog.tsx`

**Interfaces:**
- Consumes: `prisma.certification` (Task 1); `MediaField`, `TextField`, `SwitchField` from `@/components/admin/*` (existing, used unchanged); `ConfirmDialog` from `@/components/admin/confirm-dialog` (existing).
- Produces: server actions `createCertification(data: {name: string; logo: string; published: boolean})`, `updateCertification(id: string, data: {...})`, `deleteCertification(id: string)`, `toggleCertificationPublished(id: string, published: boolean)` — no other task depends on these directly, but Task 5's sidebar link routes to this page.

- [ ] **Step 1: Create the actions file**

Create `src/app/admin/(dashboard)/certifications/actions.ts`:

```ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function revalidateCertifications() {
  revalidatePath("/admin/certifications");
  revalidatePath("/admin/home/certifications");
}

export async function createCertification(data: { name: string; logo: string; published: boolean }) {
  await prisma.certification.create({ data });
  revalidateCertifications();
}

export async function updateCertification(
  id: string,
  data: { name: string; logo: string; published: boolean }
) {
  await prisma.certification.update({ where: { id }, data });
  revalidateCertifications();
}

export async function deleteCertification(id: string) {
  await prisma.certification.delete({ where: { id } });
  revalidateCertifications();
}

export async function toggleCertificationPublished(id: string, published: boolean) {
  await prisma.certification.update({ where: { id }, data: { published } });
  revalidateCertifications();
}
```

- [ ] **Step 2: Create the page**

Create `src/app/admin/(dashboard)/certifications/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { CertificationList } from "@/components/admin/certifications/certification-list";

export default async function AdminCertificationsPage() {
  const certifications = await prisma.certification.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Certifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage certification body logos shown on the home page.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Certifications" }]} />
      </div>

      <CertificationList certifications={certifications} />
    </div>
  );
}
```

- [ ] **Step 3: Create the form dialog**

Create `src/components/admin/certifications/certification-form-dialog.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TextField, SwitchField } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { useSaveAction } from "@/hooks/use-save-action";
import { createCertification, updateCertification } from "@/app/admin/(dashboard)/certifications/actions";

type CertificationFormValues = {
  name: string;
  published: boolean;
  logo: { src: string };
};

export function CertificationFormDialog({
  certification,
  trigger,
}: {
  certification?: { id: string; name: string; logo: string; published: boolean };
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<CertificationFormValues>({
    defaultValues: {
      name: certification?.name ?? "",
      published: certification?.published ?? true,
      logo: { src: certification?.logo ?? "" },
    },
  });
  const { pending, error, run } = useSaveAction();

  function onSubmit(values: CertificationFormValues) {
    const payload = { name: values.name, logo: values.logo.src, published: values.published };
    run(async () => {
      try {
        if (certification) {
          await updateCertification(certification.id, payload);
        } else {
          await createCertification(payload);
        }
      } catch (err) {
        toast.error(certification ? "Failed to update certification" : "Failed to add certification");
        throw err;
      }
      toast.success(certification ? "Certification updated" : "Certification added");
      setOpen(false);
      form.reset();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{certification ? "Edit Certification" : "Add Certification"}</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TextField label="Name" {...form.register("name", { required: true })} />
            <MediaField name="logo" mediaType="image" showAlt={false} />
            <SwitchField
              label="Published"
              checked={form.watch("published")}
              onCheckedChange={(v) => form.setValue("published", v)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: Create the list component**

Create `src/components/admin/certifications/certification-list.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CertificationFormDialog } from "@/components/admin/certifications/certification-form-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteCertification, toggleCertificationPublished } from "@/app/admin/(dashboard)/certifications/actions";

type Certification = { id: string; name: string; logo: string; published: boolean };

export function CertificationList({ certifications }: { certifications: Certification[] }) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<Certification | null>(null);

  function confirmDelete() {
    if (!toDelete) return;
    const name = toDelete.name;
    startTransition(async () => {
      try {
        await deleteCertification(toDelete.id);
        toast.success(`"${name}" deleted`);
      } catch {
        toast.error(`Failed to delete "${name}"`);
      }
    });
    setToDelete(null);
  }

  function handleTogglePublished(certification: Certification, published: boolean) {
    startTransition(async () => {
      try {
        await toggleCertificationPublished(certification.id, published);
        toast.success(`"${certification.name}" ${published ? "published" : "unpublished"}`);
      } catch {
        toast.error(`Failed to update "${certification.name}"`);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CertificationFormDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Add Certification
            </Button>
          }
        />
      </div>

      <div className="divide-y divide-border rounded-lg border border-border">
        {certifications.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">No certifications yet.</p>
        )}
        {certifications.map((certification) => (
          <div key={certification.id} className="flex items-center gap-4 p-4">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
              {certification.logo && (
                <Image
                  src={certification.logo}
                  alt={certification.name}
                  width={48}
                  height={48}
                  className="size-full object-contain"
                  unoptimized
                />
              )}
            </div>

            <span className="flex-1 text-sm font-medium">{certification.name}</span>

            <Switch
              checked={certification.published}
              disabled={pending}
              onCheckedChange={(v) => handleTogglePublished(certification, v)}
            />

            <CertificationFormDialog
              certification={certification}
              trigger={
                <Button variant="ghost" size="icon-sm">
                  <Pencil className="size-3.5" />
                </Button>
              }
            />

            <Button
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              onClick={() => setToDelete(certification)}
            >
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete certification"
        description={`Delete certification "${toDelete?.name}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
```

- [ ] **Step 5: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep -v "validator.ts"
```

Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add "src/app/admin/(dashboard)/certifications" src/components/admin/certifications
git commit -m "feat: add admin CRUD for Certification model"
```

---

### Task 5: Sidebar nav entry

**Files:**
- Modify: `src/components/admin/sidebar.tsx`

**Interfaces:**
- Consumes: route `/admin/certifications` (Task 4).
- Produces: nothing consumed by later tasks — final wiring step.

- [ ] **Step 1: Add the nav entry**

In `src/components/admin/sidebar.tsx`, in `NAV_ITEMS`, find:

```ts
  { href: "/admin/partners", label: "Partners", icon: Handshake },
```

and add directly after it:

```ts
  { href: "/admin/partners", label: "Partners", icon: Handshake },
  { href: "/admin/certifications", label: "Certifications", icon: Award },
```

(`Award` is already imported at the top of this file for the "Awards" nav entry — no import change needed.)

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep -v "validator.ts"
```

Expected: no output.

- [ ] **Step 3: Manual check**

```bash
npm run dev
```

Open `/admin` — sidebar should show "Certifications" directly under "Partners", with the Award icon. Click it, confirm it routes to `/admin/certifications` and lists the 10 rows (assuming Task 3's migration already ran).

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/sidebar.tsx
git commit -m "feat: add Certifications sidebar nav entry"
```

---

### Task 6: Home-section editor — certifications picker sourced from Certification

**Files:**
- Modify: `src/components/admin/home-sections/certifications-picker-form.tsx`
- Modify: `src/app/admin/(dashboard)/home/[key]/page.tsx`

**Interfaces:**
- Consumes: `prisma.certification` (Task 1), `saveHomeSection` from `@/app/admin/(dashboard)/home/actions` (existing, unchanged signature).
- Produces: `<CertificationsPickerForm>` now takes prop `allCertifications: {id,name,logo}[]` (was `allPartners`) and its form's array field is `certificationIds` (was `partnerIds`) — matches the `certificationIds` key Task 3's migration wrote into the HomeSection JSON, and matches what Task 2's `getHomeSection` reads.

- [ ] **Step 1: Update the picker form**

In `src/components/admin/home-sections/certifications-picker-form.tsx`, replace the whole file:

```tsx
"use client";

import Image from "next/image";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField } from "@/components/admin/form-fields";
import { Switch } from "@/components/ui/switch";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveHomeSection } from "@/app/admin/(dashboard)/home/actions";

type Certification = { id: string; name: string; logo: string };
type FormValues = { enabled: boolean; title: string; description: string; certificationIds: string[] };

export function CertificationsPickerForm({
  initialEnabled,
  initialData,
  allCertifications,
}: {
  initialEnabled: boolean;
  initialData: { title: string; description?: string; certificationIds: string[] };
  allCertifications: Certification[];
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      title: initialData.title,
      description: initialData.description ?? "",
      certificationIds: initialData.certificationIds ?? [],
    },
  });
  const { pending, error, success, run } = useSaveAction();
  const selected = form.watch("certificationIds");

  function toggle(id: string, checked: boolean) {
    const current = form.getValues("certificationIds");
    form.setValue(
      "certificationIds",
      checked ? [...current, id] : current.filter((c) => c !== id)
    );
  }

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveHomeSection("certifications", { enabled, data });
        toast.success("Certifications section saved");
      } catch (err) {
        toast.error("Failed to save certifications section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Title" {...form.register("title")} />
        <TextAreaField label="Description" {...form.register("description")} />

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

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
```

- [ ] **Step 2: Split the query in the home-section detail page**

In `src/app/admin/(dashboard)/home/[key]/page.tsx`, replace:

```ts
  const allPartners =
    key === "partners" || key === "certifications"
      ? await prisma.partner.findMany({
          where: { published: true },
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, logo: true },
        })
      : [];
```

with:

```ts
  const allPartners =
    key === "partners"
      ? await prisma.partner.findMany({
          where: { published: true },
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, logo: true },
        })
      : [];

  const allCertifications =
    key === "certifications"
      ? await prisma.certification.findMany({
          where: { published: true },
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, logo: true },
        })
      : [];
```

Then replace:

```tsx
      {key === "certifications" && (
        <CertificationsPickerForm {...meta} initialData={data} allPartners={allPartners} />
      )}
```

with:

```tsx
      {key === "certifications" && (
        <CertificationsPickerForm {...meta} initialData={data} allCertifications={allCertifications} />
      )}
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep -v "validator.ts"
```

Expected: no output.

- [ ] **Step 4: Manual verification**

```bash
npm run dev
```

Open `/admin/home/certifications` — should show the 10 certifications (CE, EX, SIL3, ...) with toggles reflecting the current `certificationIds`, title/description editable. Toggle one off, save, reload — confirm it persisted. Open `/admin/home/partners` — should still show the 18 real partners, unaffected.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/home-sections/certifications-picker-form.tsx "src/app/admin/(dashboard)/home/[key]/page.tsx"
git commit -m "feat: source certifications home-section picker from Certification model"
```

---

### Task 7: Seed file — add CERTIFICATIONS array

**Files:**
- Modify: `prisma/seed-home.ts`

**Interfaces:**
- Consumes: `prisma.certification.create` (Task 1).
- Produces: nothing consumed by other tasks — this only affects fresh-DB seeding, not the already-migrated live DB.

- [ ] **Step 1: Add the CERTIFICATIONS array**

In `prisma/seed-home.ts`, right after the `PARTNERS` array (currently ends at line 247), add:

```ts
const CERTIFICATIONS: { id: string; name: string; logo: string }[] = [
  { id: "cert_001", name: "CE", logo: "https://cdn.rotex.com/certifications/ce.png" },
  { id: "cert_002", name: "EX", logo: "https://cdn.rotex.com/certifications/ex.png" },
  { id: "cert_003", name: "SIL3", logo: "https://cdn.rotex.com/certifications/sil3.png" },
  { id: "cert_004", name: "IATF", logo: "https://cdn.rotex.com/certifications/iatf.png" },
  { id: "cert_005", name: "inmetro", logo: "https://cdn.rotex.com/certifications/inmetro.png" },
  { id: "cert_006", name: "ISI", logo: "https://cdn.rotex.com/certifications/isi.png" },
  { id: "cert_007", name: "KOSHA", logo: "https://cdn.rotex.com/certifications/kosha.png" },
  { id: "cert_008", name: "PCT", logo: "https://cdn.rotex.com/certifications/pct.png" },
  { id: "cert_009", name: "PED", logo: "https://cdn.rotex.com/certifications/ped.png" },
  { id: "cert_010", name: "UL", logo: "https://cdn.rotex.com/certifications/ul.png" },
];
```

- [ ] **Step 2: Switch the certifications section to certificationIds**

Find (currently lines 372-380):

```ts
  {
    key: "certifications",
    order: 6,
    data: {
      title: "Certified & Trusted Worldwide",
      description: "Recognised and certified by leading global standards bodies and industry partners.",
      partnerIds: PARTNERS.map((p) => p.id),
    },
  },
```

Replace with:

```ts
  {
    key: "certifications",
    order: 6,
    data: {
      title: "Certified & Trusted Worldwide",
      description: "Recognised and certified by leading global standards bodies and industry partners.",
      certificationIds: CERTIFICATIONS.map((c) => c.id),
    },
  },
```

- [ ] **Step 3: Add the seeding loop**

Find the existing partner-seeding loop (currently lines 426-432):

```ts
  for (const partner of PARTNERS) {
    await prisma.partner.upsert({
      where: { id: partner.id },
      update: { name: partner.name, logo: partner.logo },
      create: { id: partner.id, name: partner.name, logo: partner.logo, published: true },
    });
  }
```

Add directly after its closing `}`:

```ts
  for (const certification of CERTIFICATIONS) {
    await prisma.certification.upsert({
      where: { id: certification.id },
      update: { name: certification.name, logo: certification.logo },
      create: { id: certification.id, name: certification.name, logo: certification.logo, published: true },
    });
  }
```

- [ ] **Step 4: Update the summary log line**

Find (currently line 507):

```ts
  console.log(`Seeded global config, home SEO, ${PARTNERS.length} partners, and ${SECTIONS.length} home sections.`);
```

Replace with:

```ts
  console.log(`Seeded global config, home SEO, ${PARTNERS.length} partners, ${CERTIFICATIONS.length} certifications, and ${SECTIONS.length} home sections.`);
```

- [ ] **Step 5: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep -v "validator.ts"
```

Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add prisma/seed-home.ts
git commit -m "feat: seed Certification records separately from Partner"
```

(Do not run this seed script against the live DB — it's for fresh-DB setup only, and the live DB was already migrated in Task 3.)

---

### Task 8: Full build verification

**Files:**
- None (verification only).

**Interfaces:**
- Consumes: everything from Tasks 1-7.
- Produces: nothing — final gate.

- [ ] **Step 1: Full typecheck**

```bash
npx tsc --noEmit 2>&1 | grep -v "validator.ts"
```

Expected: no output.

- [ ] **Step 2: Full build**

```bash
npm run build
```

Expected: build succeeds, no errors. Confirm `/admin/certifications`, `/admin/home/[key]`, and the home page route all appear in the route list without errors.

- [ ] **Step 3: Manual end-to-end check**

```bash
npm run dev
```

- `/admin/partners`: exactly 18 rows (Scania...NIGC), no CE/EX/etc.
- `/admin/certifications`: exactly 10 rows (CE, EX, SIL3, IATF, inmetro, ISI, KOSHA, PCT, PED, UL), add/edit/delete/toggle all work.
- `/admin/home/certifications`: picker shows the 10 certifications, title/description save correctly.
- `/admin/home/partners`: picker shows the 18 partners, unaffected.
- `/` (home page): both the partners-trust-bar and certifications sections render the same logos as before this change (visually unchanged from pre-migration screenshots).

- [ ] **Step 4: No commit needed** — this task is verification-only.
