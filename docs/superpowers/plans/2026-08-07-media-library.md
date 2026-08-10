# Global Media Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** a site-wide media library — upload an image or video once, browse and reuse it anywhere via a picker dialog — wired into the About Story section's video field and the About Gallery section's images.

**Architecture:** a new `MediaAsset` Prisma model (`id`, `url`, `type`, `filename`, `alt`, `createdAt`) is the single source of truth. `/api/admin/media` (GET list, POST register) and `/api/admin/media/[id]` (DELETE) expose it, mirroring the existing `/api/admin/upload` route's auth and response shape. A shared client helper (`src/lib/media-upload.ts`) wraps "upload the file, then register it" into one call, used by both the standalone `/admin/media` library page and the `MediaPicker` dialog component. `MediaPicker` is dropped into the Story form (single video) and Gallery form (multiple images), replacing their current raw-URL/one-off-upload inputs.

**Tech Stack:** Next.js App Router (server components + Route Handlers), Prisma (SQLite), react-hook-form, the existing `Dialog` primitive (`src/components/ui/dialog.tsx`, base-ui), Tailwind.

## Global Constraints

- No file deletion from disk when a `MediaAsset` row is deleted — out of scope (matches spec).
- Scope is Story video + About Gallery only — do not touch Grow-With-Rotex image, Partner logos, or Resource images.
- Reuse the existing `/api/admin/upload` route unchanged — it still only writes the file and returns `{ url }`. New code registers the metadata separately via `/api/admin/media`.
- Auth pattern for new API routes: `const session = await auth(); if (!session) return 401` — copied verbatim from `src/app/api/admin/upload/route.ts`.
- No pagination on `/admin/media` for v1 — plain `findMany` ordered by `createdAt desc`.

---

### Task 1: `MediaAsset` Prisma model + migration

**Files:**
- Modify: `prisma/schema.prisma` (add model, after the closing `}` of `model AboutSection` at line ~170)

**Interfaces:**
- Produces: `prisma.mediaAsset` client with `{ id: string, url: string, type: string, filename: string, alt: string | null, createdAt: Date }`, used by every later task.

- [ ] **Step 1: Add the model to the schema**

In `prisma/schema.prisma`, immediately after the closing `}` of `model AboutSection`, add:

```prisma
model MediaAsset {
  id        String   @id @default(cuid())
  url       String
  type      String
  filename  String
  alt       String?
  createdAt DateTime @default(now())
}
```

- [ ] **Step 2: Run the migration**

Run: `npx prisma migrate dev --name add_media_asset`

This repo's migration history contains a pre-existing duplicate-column bug in an older migration (`20260714184004_add_enquiry`) that breaks Prisma's shadow-database diffing. If `migrate dev` fails with `P3006` / `duplicate column name`, use this fallback instead (the real `dev.db` is unaffected — only shadow-db diffing is broken):

```bash
mkdir -p prisma/migrations/20260807010000_add_media_asset
cat > prisma/migrations/20260807010000_add_media_asset/migration.sql << 'EOF'
-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "alt" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
EOF
npx prisma db execute --file prisma/migrations/20260807010000_add_media_asset/migration.sql
npx prisma migrate resolve --applied 20260807010000_add_media_asset
```

Expected (either path): migration applies, `npx prisma migrate status` reports "Database schema is up to date!".

- [ ] **Step 3: Generate the client and verify**

Run: `npx prisma generate`
Then: `find src/generated/prisma -iname "*.ts" | xargs grep -l "mediaAsset\|MediaAsset" | head -3`
Expected: at least one match (e.g. `src/generated/prisma/models/MediaAsset.ts`).

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations dev.db
git commit -m "feat: add MediaAsset model for global media library"
```

---

### Task 2: Client helper — `src/lib/media-upload.ts`

**Files:**
- Create: `src/lib/media-upload.ts`

**Interfaces:**
- Consumes: `/api/admin/upload` (existing, unchanged), `/api/admin/media` (Task 3 — this task is written first but the functions it defines aren't exercised until Task 3's routes exist).
- Produces: `MediaAssetDTO` type, `uploadAndRegisterMedia(file: File): Promise<MediaAssetDTO>`, `fetchMediaAssets(type: "image" | "video"): Promise<MediaAssetDTO[]>`, `deleteMediaAsset(id: string): Promise<void>` — used by Task 4 (`MediaPicker`) and Task 5 (`/admin/media` page).

- [ ] **Step 1: Write the helper**

Create `src/lib/media-upload.ts`:

```ts
export type MediaAssetDTO = {
  id: string;
  url: string;
  type: "image" | "video";
  filename: string;
  alt: string | null;
  createdAt: string;
};

export async function uploadAndRegisterMedia(file: File): Promise<MediaAssetDTO> {
  const formData = new FormData();
  formData.append("file", file);
  const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const uploadJson = await uploadRes.json();
  if (!uploadJson.success) {
    throw new Error(uploadJson.error?.message ?? "Upload failed");
  }

  const type: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
  const registerRes = await fetch("/api/admin/media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: uploadJson.data.url, type, filename: file.name }),
  });
  const registerJson = await registerRes.json();
  if (!registerJson.success) {
    throw new Error(registerJson.error?.message ?? "Failed to register media");
  }
  return registerJson.data;
}

export async function fetchMediaAssets(type: "image" | "video"): Promise<MediaAssetDTO[]> {
  const res = await fetch(`/api/admin/media?type=${type}`);
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message ?? "Failed to load media");
  }
  return json.data;
}

export async function deleteMediaAsset(id: string): Promise<void> {
  const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message ?? "Failed to delete media");
  }
}
```

- [ ] **Step 2: Verify**

Run: `npx eslint src/lib/media-upload.ts`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/media-upload.ts
git commit -m "feat: add media upload/list/delete client helper"
```

---

### Task 3: API routes — `/api/admin/media` and `/api/admin/media/[id]`

**Files:**
- Create: `src/app/api/admin/media/route.ts`
- Create: `src/app/api/admin/media/[id]/route.ts`

**Interfaces:**
- Consumes: `prisma.mediaAsset` (Task 1), `auth` from `@/lib/auth` (same import used by `src/app/api/admin/upload/route.ts`).
- Produces: `GET /api/admin/media?type=image|video` → `{ success: true, data: MediaAssetDTO[] }`; `POST /api/admin/media` (body `{ url, type, filename, alt? }`) → `{ success: true, data: MediaAssetDTO }`; `DELETE /api/admin/media/[id]` → `{ success: true }`. Consumed by Task 2's helper functions (already written against this exact contract).

- [ ] **Step 1: Write the list + register route**

Create `src/app/api/admin/media/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type");
  const assets = await prisma.mediaAsset.findMany({
    where: type ? { type } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: assets });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 });
  }

  const body = await req.json();
  const { url, type, filename, alt } = body as { url?: string; type?: string; filename?: string; alt?: string };

  if (!url || !type || !filename) {
    return NextResponse.json({ success: false, error: { code: "BAD_REQUEST", message: "url, type, and filename are required" } }, { status: 400 });
  }

  const asset = await prisma.mediaAsset.create({
    data: { url, type, filename, alt: alt ?? null },
  });

  return NextResponse.json({ success: true, data: asset });
}
```

- [ ] **Step 2: Write the delete route**

Create `src/app/api/admin/media/[id]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 });
  }

  const { id } = await params;
  await prisma.mediaAsset.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Verify the routes respond**

Run: `npm run dev &`, wait for it to be ready (`timeout 30 bash -c 'until curl -sf http://localhost:3000 >/dev/null; do sleep 1; done'`), then check the route requires auth:

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/admin/media`
Expected: `401` (no session cookie).

Stop the dev server: `pkill -f "next dev"`.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/media
git commit -m "feat: add media library API routes"
```

---

### Task 4: `MediaPicker` component

**Files:**
- Create: `src/components/admin/media-picker.tsx`

**Interfaces:**
- Consumes: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` (`src/components/ui/dialog.tsx`), `Button` (`src/components/ui/button.tsx`), `fetchMediaAssets`/`uploadAndRegisterMedia`/`MediaAssetDTO` (Task 2).
- Produces: `MediaPicker` component, consumed by Task 6 (Story form) and Task 7 (Gallery form). Props contract (exact): `{ type: "image" | "video"; multiple?: boolean; onSelect: (urls: string[]) => void; triggerRender: React.ReactElement; children: React.ReactNode }`. `triggerRender` supplies the trigger's element/style (e.g. `<Button type="button" variant="outline" size="sm" className="gap-1.5" />` with no children of its own); `children` supplies the trigger's visible label/icon content — this mirrors the existing `DialogClose` usage in `src/components/ui/dialog.tsx` (`render={<Button .../>}` plus separate children).

- [ ] **Step 1: Write the component**

Create `src/components/admin/media-picker.tsx`:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Loader2, FileVideo, Check } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { fetchMediaAssets, uploadAndRegisterMedia, type MediaAssetDTO } from "@/lib/media-upload";

type MediaPickerProps = {
  type: "image" | "video";
  multiple?: boolean;
  onSelect: (urls: string[]) => void;
  triggerRender: React.ReactElement;
  children: React.ReactNode;
};

export function MediaPicker({ type, multiple = false, onSelect, triggerRender, children }: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<MediaAssetDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  async function loadAssets() {
    setLoading(true);
    try {
      setAssets(await fetchMediaAssets(type));
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setSelected([]);
      loadAssets();
    }
  }

  function selectSingle(url: string) {
    onSelect([url]);
    setOpen(false);
  }

  function toggleMultiSelect(url: string) {
    setSelected((prev) => (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const asset = await uploadAndRegisterMedia(file);
      setAssets((prev) => [asset, ...prev]);
      if (multiple) {
        toggleMultiSelect(asset.url);
      } else {
        selectSingle(asset.url);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function confirmSelection() {
    onSelect(selected);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={triggerRender}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Choose {type === "video" ? "Video" : "Image"}
            {multiple ? "s" : ""}
          </DialogTitle>
        </DialogHeader>

        <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-sm font-medium hover:bg-accent">
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          {uploading ? "Uploading..." : "Upload new"}
          <input
            type="file"
            accept={type === "video" ? "video/*" : "image/*"}
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>

        <div className="grid max-h-96 grid-cols-4 gap-3 overflow-y-auto">
          {loading && <p className="col-span-4 py-8 text-center text-sm text-muted-foreground">Loading...</p>}
          {!loading && assets.length === 0 && (
            <p className="col-span-4 py-8 text-center text-sm text-muted-foreground">No {type}s uploaded yet.</p>
          )}
          {assets.map((asset) => {
            const isSelected = selected.includes(asset.url);
            return (
              <button
                type="button"
                key={asset.id}
                onClick={() => (multiple ? toggleMultiSelect(asset.url) : selectSingle(asset.url))}
                className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border-2 bg-muted/30 ${
                  isSelected ? "border-primary" : "border-transparent"
                }`}
              >
                {asset.type === "image" ? (
                  <Image src={asset.url} alt={asset.alt ?? asset.filename} fill className="object-cover" unoptimized />
                ) : (
                  <FileVideo className="size-8 text-muted-foreground" />
                )}
                {isSelected && (
                  <span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {multiple && (
          <DialogFooter>
            <Button type="button" onClick={confirmSelection} disabled={selected.length === 0}>
              Add selected ({selected.length})
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx eslint src/components/admin/media-picker.tsx`
Expected: no errors. (Not reachable from a page yet — Tasks 6-7 wire it in; full manual verification happens there.)

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/media-picker.tsx
git commit -m "feat: add MediaPicker dialog component"
```

---

### Task 5: `/admin/media` library page + sidebar nav

**Files:**
- Create: `src/components/admin/media-library-client.tsx`
- Create: `src/app/admin/(dashboard)/media/page.tsx`
- Modify: `src/components/admin/sidebar.tsx`

**Interfaces:**
- Consumes: `prisma.mediaAsset` (Task 1), `uploadAndRegisterMedia`/`deleteMediaAsset`/`MediaAssetDTO` (Task 2).
- Produces: the standalone browse/upload/delete page at `/admin/media`. Not consumed by later tasks — this is the terminal UI for library management.

- [ ] **Step 1: Write the client grid component**

Create `src/components/admin/media-library-client.tsx`:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Loader2, FileVideo, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadAndRegisterMedia, deleteMediaAsset, type MediaAssetDTO } from "@/lib/media-upload";

export function MediaLibraryClient({ initialAssets }: { initialAssets: MediaAssetDTO[] }) {
  const [assets, setAssets] = useState(initialAssets);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const asset = await uploadAndRegisterMedia(file);
      setAssets((prev) => [asset, ...prev]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this media asset? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteMediaAsset(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-sm font-medium hover:bg-accent">
        {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
        {uploading ? "Uploading..." : "Upload file"}
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />
      </label>

      {assets.length === 0 ? (
        <p className="text-sm text-muted-foreground">No media uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {assets.map((asset) => (
            <div key={asset.id} className="space-y-2">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30">
                {asset.type === "image" ? (
                  <Image src={asset.url} alt={asset.alt ?? asset.filename} fill className="object-cover" unoptimized />
                ) : (
                  <FileVideo className="size-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs text-muted-foreground">{asset.filename}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={deletingId === asset.id}
                  onClick={() => handleDelete(asset.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write the page**

Create `src/app/admin/(dashboard)/media/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { MediaLibraryClient } from "@/components/admin/media-library-client";
import type { MediaAssetDTO } from "@/lib/media-upload";

export default async function AdminMediaPage() {
  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });

  const initialAssets: MediaAssetDTO[] = assets.map((a) => ({
    id: a.id,
    url: a.url,
    type: a.type as "image" | "video",
    filename: a.filename,
    alt: a.alt,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Media Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload images and videos here to reuse them across the site.
        </p>
      </div>

      <MediaLibraryClient initialAssets={initialAssets} />
    </div>
  );
}
```

- [ ] **Step 3: Add sidebar nav entry**

In `src/components/admin/sidebar.tsx`, add `Image as ImageIcon` to the `lucide-react` import and insert a nav item between Resources and Enquiries:

```ts
import { LayoutDashboard, Package, Factory, Home, Info, Settings, Handshake, Quote, Mail, BookOpen, Image as ImageIcon } from "lucide-react";
```

```ts
const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/home", label: "Home Page", icon: Home },
  { href: "/admin/about", label: "About Page", icon: Info },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/industries", label: "Industries", icon: Factory },
  { href: "/admin/partners", label: "Partners", icon: Handshake },
  { href: "/admin/customer-stories", label: "Customer Stories", icon: Quote },
  { href: "/admin/resources", label: "Resources", icon: BookOpen },
  { href: "/admin/media", label: "Media Library", icon: ImageIcon },
  { href: "/admin/enquiries", label: "Enquiries", icon: Mail },
  { href: "/admin/global", label: "Global Config", icon: Settings },
];
```

- [ ] **Step 4: Verify**

Run: `npx eslint src/components/admin/media-library-client.tsx "src/app/admin/(dashboard)/media/page.tsx" src/components/admin/sidebar.tsx`
Expected: no new errors (pre-existing `sidebar.tsx:29` `set-state-in-effect` error is unrelated and already present on `main` — do not fix it as part of this task).

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/media-library-client.tsx "src/app/admin/(dashboard)/media/page.tsx" src/components/admin/sidebar.tsx
git commit -m "feat: add Media Library admin page and nav entry"
```

---

### Task 6: Wire Story form's video field to `MediaPicker`

**Files:**
- Modify: `src/components/admin/about-sections/story-form.tsx`

**Interfaces:**
- Consumes: `MediaPicker` (Task 4).

- [ ] **Step 1: Replace the video text field with a picker**

In `src/components/admin/about-sections/story-form.tsx`, add the import:

```ts
import { MediaPicker } from "@/components/admin/media-picker";
import { Upload } from "lucide-react";
```

Replace this line:

```tsx
        <TextField label="Video Src" {...form.register("videoSrc")} />
```

with:

```tsx
        <div className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Video</span>
          <div className="flex items-center gap-3">
            <MediaPicker
              type="video"
              onSelect={(urls) => form.setValue("videoSrc", urls[0], { shouldDirty: true })}
              triggerRender={<Button type="button" variant="outline" size="sm" className="gap-1.5" />}
            >
              <Upload className="size-3.5" />
              Choose Video
            </MediaPicker>
            {form.watch("videoSrc") && (
              <span className="truncate text-sm text-muted-foreground">{form.watch("videoSrc")}</span>
            )}
          </div>
          {form.watch("videoSrc") && (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={form.watch("videoSrc")} muted className="h-32 w-full rounded-lg border border-border object-cover" />
          )}
        </div>
```

Also add the `Button` import if not already present:

```ts
import { Button } from "@/components/ui/button";
```

- [ ] **Step 2: Verify**

Run: `npx eslint src/components/admin/about-sections/story-form.tsx`
Expected: no new errors (the pre-existing `form.watch` "incompatible library" warning is expected and unrelated).

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/about-sections/story-form.tsx
git commit -m "feat: wire Story form video field to MediaPicker"
```

---

### Task 7: Wire Gallery form's images to `MediaPicker`

**Files:**
- Modify: `src/components/admin/about-sections/gallery-form.tsx`

**Interfaces:**
- Consumes: `MediaPicker` (Task 4).

- [ ] **Step 1: Replace the per-row upload button with a single "Add Images" picker**

In `src/components/admin/about-sections/gallery-form.tsx`, replace the full file contents with:

```tsx
"use client";

import { useForm, FormProvider, useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, RepeaterItem } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/admin/media-picker";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type GalleryImage = { src: string; alt: string };
type FormValues = { enabled: boolean; images: GalleryImage[] };

export function GalleryForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { images: GalleryImage[] };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "images" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("gallery", { enabled, data });
        toast.success("Gallery section saved");
      } catch (err) {
        toast.error("Failed to save Gallery section");
        throw err;
      }
    });
  }

  function handleAddImages(urls: string[]) {
    urls.forEach((src) => append({ src, alt: "" }));
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />

        <MediaPicker
          type="image"
          multiple
          onSelect={handleAddImages}
          triggerRender={<Button type="button" variant="outline" size="sm" className="gap-1.5" />}
        >
          <Plus className="size-3.5" />
          Add Images
        </MediaPicker>

        <div className="space-y-3">
          {fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Image ${i + 1}`} onRemove={() => remove(i)}>
              <GalleryImageRow index={i} />
            </RepeaterItem>
          ))}
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}

function GalleryImageRow({ index }: { index: number }) {
  const form = useFormContext<FormValues>();
  const src = form.watch(`images.${index}.src`);

  return (
    <div className="space-y-3">
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-32 w-full rounded-lg border border-border object-cover" />
      )}
      <TextField label="Alt Text" {...form.register(`images.${index}.alt`)} />
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx eslint src/components/admin/about-sections/gallery-form.tsx`
Expected: no errors, no unused imports (the old per-row upload logic — `useRef`, `useState`, `useWatch`, `Upload`, `Loader2`, `AddButton` — is fully removed, not left dangling).

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/about-sections/gallery-form.tsx
git commit -m "feat: wire Gallery form images to MediaPicker"
```

---

### Task 8: Full build + end-to-end manual verification

**Files:** none (verification only).

- [ ] **Step 1: Lint + build**

Run: `npm run lint`
Expected: no new errors beyond the pre-existing repo-wide ones already present on `main` before this plan (`theme-toggle.tsx`, `channel-partner-stats-section.tsx`, `industry-enquiry-form.tsx`, `trusted-countries-banner.tsx`, `sidebar.tsx:29`) — confirm by running `git stash`, re-running lint, comparing, then `git stash pop` if any new-looking error is ambiguous.

Run: `npm run build`
Expected: build succeeds; `/admin/media`, `/api/admin/media`, `/api/admin/media/[id]` all appear in the route list.

- [ ] **Step 2: Manual verification in the browser**

Run: `npm run dev`, log into `/admin/login` (`admin@rotex.com` / `changeme123` unless overridden via `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`), then:

1. Visit `/admin/media`. Upload an image. Confirm it appears in the grid immediately (no reload needed).
2. Upload a video (`.mp4`). Confirm it shows the video-file icon (not a broken image).
3. Delete the image you uploaded. Confirm it disappears from the grid.
4. Visit `/admin/about/story`. Click "Choose Video" — confirm the dialog opens showing only videos (not the deleted image). Upload a new video from inside the dialog — confirm it auto-selects and closes the dialog, and the `<video>` preview appears in the form.
5. Click "Save changes". Open `/about` in a new tab — confirm the story section's video source changed.
6. Visit `/admin/about/gallery`. Click "Add Images" — confirm the dialog opens showing only images. Select 2-3 existing images (multi-select, checkmarks toggle) and click "Add selected" — confirm they appear as new rows with empty Alt Text fields.
7. Fill in alt text for each, click "Save changes". Open `/about` in the same tab, scroll to the gallery — confirm the selected images appear in the swiper.
8. Revisit `/admin/media` — confirm the images/video used in steps 4-6 are still listed (nothing was accidentally deleted by the picker flow).

Stop the dev server once verified.

- [ ] **Step 3: Commit (if any fixes were needed during manual verification)**

If manual verification surfaced no code changes, skip this step — Task 7's commit is the last one. Otherwise:

```bash
git add -A
git commit -m "fix: address issues found during media library manual verification"
```
