import { notFound } from "next/navigation";

// Catches every site URL no other route matched (deeper/unknown paths that
// don't hit [legalSlug] or any other dynamic route) so the branded not-found.tsx
// renders instead of Next's default 404 — see the admin equivalent for why.
export default function SiteCatchAll(): never {
  notFound();
}
