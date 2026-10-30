import "server-only";
import path from "path";
import { mkdir, realpath } from "fs/promises";

/*
  The server folder admins manage from Admin → Import Files, and the only place
  the import's "Choose from server" zip picker may read from.
*/
export const IMPORT_BROWSE_ROOT = process.env.IMPORT_BROWSE_ROOT ?? path.join(process.cwd(), "import-files");

/** Real path of the root, creating the folder the first time it's needed. */
export async function browseRoot(): Promise<string> {
  await mkdir(IMPORT_BROWSE_ROOT, { recursive: true });
  return realpath(IMPORT_BROWSE_ROOT);
}

function inside(root: string, target: string): boolean {
  return target === root || target.startsWith(root + path.sep);
}

/** Resolves an existing path (absolute or root-relative), refusing anything outside the root. */
export async function resolveBrowsePath(input: string | null | undefined): Promise<string | null> {
  const root = await browseRoot();
  const target = path.resolve(root, input || ".");
  let real: string;
  try {
    real = await realpath(target);
  } catch {
    return null;
  }
  return inside(root, real) ? real : null;
}

/** A single file/folder name — no separators, no hidden or dot names, no control characters. */
export function validEntryName(name: unknown): string | null {
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 200) return null;
  if (trimmed.startsWith(".") || /[\/\\\x00-\x1f]/.test(trimmed)) return null;
  return trimmed;
}
