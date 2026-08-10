# Global Media Library — Design

**Goal:** a single, site-wide media library — upload an image or video once, reuse it anywhere via a picker — starting with two consumers: the About Story section's video field and the About Gallery section's images.

**Why this first:** the user's broader request (Journey/Countries/Achievements as global tables with per-page selection) follows the exact global-list + picker pattern already used for `Resource`/`Partner`. The Media Library is the one genuinely new subsystem — build it first, then Journey/Countries/Achievements reuse the established pattern in later specs.

**Scope for this spec:** Media Library data model, admin browse/upload/delete page, `MediaPicker` component, and wiring it into Story (video) and Gallery (images) only. Other existing upload buttons (Grow-With-Rotex image, Partner logos, Resource images) are explicitly out of scope and keep working standalone.

## Data model

```prisma
model MediaAsset {
  id        String   @id @default(cuid())
  url       String
  type      String   // "image" | "video"
  filename  String
  alt       String?
  createdAt DateTime @default(now())
}
```

No `updatedAt` — assets are immutable once uploaded (delete + re-upload to replace).

## API routes

- `GET /api/admin/media?type=image|video` — list assets, optionally filtered by type, newest first. Auth-gated like other `/api/admin/*` routes.
- `POST /api/admin/media` — body `{ url, type, filename, alt? }`. Called right after a successful `/api/admin/upload` to persist the metadata row. Returns the created `MediaAsset`.
- `DELETE /api/admin/media/[id]` — removes the row. Does not delete the underlying file on disk (matches how `/api/admin/upload` already has no corresponding delete — out of scope to add file cleanup here).

The existing `/api/admin/upload` route is unchanged — it still just writes the file and returns `{ url }`. The picker's upload flow calls `/api/admin/upload` first, then `POST /api/admin/media` with the returned URL.

## Admin page: `/admin/media`

New sidebar nav entry ("Media Library", between Resources and Enquiries — matches alphabetical-ish grouping of content-management pages).

- Grid of asset thumbnails (images render as `<img>`, videos render as a video-file icon + filename — no inline video preview in the grid to keep it lightweight).
- Each tile: thumbnail/icon, filename, delete button (confirms before deleting).
- Upload button at the top (same file input + `/api/admin/upload` → `POST /api/admin/media` flow as the picker, so the standalone page and the in-form picker share one upload function).
- No pagination for v1 — a `findMany` ordered by `createdAt desc`. Revisit if the library grows large.

## `MediaPicker` component

`src/components/admin/media-picker.tsx`, a dialog (using the existing `src/components/ui/dialog.tsx` primitive):

```ts
type MediaPickerProps = {
  type: "image" | "video";
  multiple?: boolean;
  onSelect: (urls: string[]) => void; // always an array; callers destructure [0] when multiple is false
  trigger: React.ReactNode; // the button/element that opens the dialog
};
```

Dialog contents:
- Upload button at the top (same upload-then-register flow as the `/admin/media` page).
- Grid of existing assets filtered by `type`, fetched client-side from `GET /api/admin/media?type=...` when the dialog opens.
- Click to select (checkbox tiles when `multiple`, single click-to-close when not).
- "Add selected" button (multi mode) confirms the selection and calls `onSelect`; single mode calls `onSelect` immediately on click and closes.

## Integration: Story form

`src/components/admin/about-sections/story-form.tsx` — replace the `TextField label="Video Src"` with:

- A "Choose Video" button (`MediaPicker` trigger, `type="video"`, `multiple={false}`) showing the currently selected filename/URL next to it.
- A small `<video>` preview (muted, no controls needed — just confirms the right file) below, shown when `videoSrc` is set.
- `onSelect` sets `form.setValue("videoSrc", urls[0], { shouldDirty: true })`.

## Integration: Gallery form

`src/components/admin/about-sections/gallery-form.tsx` — replace the per-row "Choose File" upload button with:

- A single "Add Images" button at the top (`MediaPicker` trigger, `type="image"`, `multiple={true}`) instead of one upload button per repeater row.
- `onSelect` appends one `{ src: url, alt: "" }` entry per selected URL to the `images` field array via `append`.
- Each row keeps its existing "Alt Text" field and remove button — only the upload mechanism changes, the per-image alt-text editing stays as-is.

## Out of scope (confirmed with user)

- Wiring the picker into Grow-With-Rotex image, Partner logos, or Resource images — those keep their existing standalone upload buttons.
- File deletion from disk when a `MediaAsset` row is deleted.
- Journey milestones, Trusted Countries, Achievements as global tables — separate follow-up specs, built after this lands, reusing the same list+picker shape as `Resource`/`Partner`.
