import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { KeyboardEvent } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** onKeyDown guard for numeric-only inputs (phone numbers) — blocks letters
 * and symbols while still allowing Backspace/Delete/arrows/Tab and
 * copy-paste-select shortcuts (Ctrl/Cmd/Alt combos). */
export function digitsOnlyKeyDown(e: KeyboardEvent<HTMLInputElement>) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key.length !== 1) return;
  if (!/[0-9]/.test(e.key)) e.preventDefault();
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
