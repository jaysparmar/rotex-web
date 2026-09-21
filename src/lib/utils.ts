import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { KeyboardEvent } from "react"
import type { FieldErrors, FieldValues } from "react-hook-form"

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

/** react-hook-form's `handleSubmit` blocks the submit when validation fails,
 * but on long forms the invalid field is often scrolled out of view — the
 * submit button just looks broken. Pass this as the `onInvalid` callback so
 * the first errored field scrolls into view and gets focus. */
export function scrollToFirstFormError<T extends FieldValues>(errors: FieldErrors<T>) {
  const firstField = Object.keys(errors)[0];
  if (!firstField) return;
  // Native inputs get located by their `name` attribute; custom Select/Combobox
  // fields (bridged via react-hook-form's Controller) render no such attribute,
  // so their wrapping Field is tagged with matching `data-field` instead.
  const el = document.querySelector<HTMLElement>(
    `[name="${firstField}"], [data-field="${firstField}"]`
  );
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.focus({ preventScroll: true });
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
