# Resource Content Editor: Markdown → HTML (TinyMCE)

## Problem
Resource admin content field is a plain markdown `<Textarea>`. Client wants a normal WYSIWYG HTML editor. Frontend currently renders content via `ReactMarkdown` + `remark-gfm`; TOC sidebar extracts `## heading` markdown syntax via regex.

## Decisions
- Editor: TinyMCE, self-hosted (`tinymce` + `@tinymce/tinymce-react` npm packages, no API key, no cloud dependency).
- Content field always stores HTML going forward. Markdown editor removed entirely — no dual-mode.
- Legacy markdown records: converted to HTML once, at save time, when an admin re-opens and edits+saves that resource through the new editor (via `marked` in the admin form only). No DB migration script, no runtime markdown fallback in the frontend renderer.
- Frontend: drop `ReactMarkdown`/`remark-gfm` render path. Content rendered as raw HTML via `dangerouslySetInnerHTML`, sanitized with `isomorphic-dompurify`.
- TOC: regex updated to match `<h2[^>]*>(.*?)</h2>` instead of `^##\s+`.

## Scope / non-goals
- No DB migration for existing records — accepted tradeoff, old unedited resources show raw markdown text on the public page until an admin resaves them once via the new editor.
- No change to `resource.content` DB column type (still `String`/text).

## Changes

### Packages
Add: `tinymce`, `@tinymce/tinymce-react`, `marked`, `isomorphic-dompurify`.

### `src/components/admin/resources/resource-edit-form.tsx`
- `ContentField`: replace `<Textarea>` + manual "Insert Image" button/file input with `<Editor>` from `@tinymce/tinymce-react`.
- Self-hosted via `tinymceScriptSrc` pointing at a copy of `tinymce` under `public/tinymce` (copied via a `postinstall`/build step or committed static assets — pick simplest working option during implementation).
- On init, if `resource.content` has no `<` HTML tag chars, run `marked.parse()` once to seed editor value (does not persist until saved).
- Wire `images_upload_handler` to existing `POST /api/admin/upload`, return `{ location: json.data.url }`.
- Toolbar: headings (h2/h3), bold/italic, bullet/numbered list, link, image, blockquote, table.

### `src/components/sections/post-detail-section.tsx`
- Remove `ReactMarkdown`, `remark-gfm`, `markdownComponents` import/usage.
- Render `post.content` via sanitized `dangerouslySetInnerHTML` in a container div carrying the existing typographic classes (moved from per-component `markdownComponents` to scoped CSS targeting `h2`, `h3`, `p`, `a`, `ul`, `ol`, `img`, `strong` under that container).

### `src/lib/markdown-toc.ts`
- `extractToc`: match `<h2[^>]*>(.*?)</h2>`, strip any nested tags from captured text, keep `slugifyHeading` as-is.

## Testing
- Admin: create new resource, type formatted content in TinyMCE, save, reload — content persists as HTML, editor re-renders it correctly.
- Admin: open an existing markdown resource — editor shows it converted to formatted HTML (not raw `##` text), save, confirm DB now holds HTML.
- Frontend: resource detail page renders saved HTML correctly (headings, bold, links, lists, images), TOC sidebar populates from `<h2>` entries and anchors scroll correctly.
- Image upload button in TinyMCE toolbar uploads via existing endpoint and inserts image.
