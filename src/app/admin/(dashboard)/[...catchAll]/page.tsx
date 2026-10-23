import { notFound } from "next/navigation";

// Catches every admin URL no other route matched — Next's own not-found.tsx
// only fires for notFound() called from a page that already matched, so a
// truly unknown nested path (e.g. /admin/global/maintenance/dfd) otherwise
// falls through to Next's default 404 instead of this group's branded one.
export default function AdminCatchAll(): never {
  notFound();
}
