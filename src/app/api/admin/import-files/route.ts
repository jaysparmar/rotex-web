import { NextRequest, NextResponse } from "next/server";
import { mkdir, readdir, rename, rm, stat } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { browseRoot, resolveBrowsePath, validEntryName } from "@/lib/import-files";

export const dynamic = "force-dynamic";

export type ImportFileEntry = { name: string; path: string; type: "dir" | "file"; size: number; modifiedAt: string };

function fail(code: string, message: string, status = 400) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

async function exists(p: string) {
  return Boolean(await stat(p).catch(() => null));
}

/** Lists one folder under the import root (hidden and in-progress upload files are skipped). */
export async function GET(req: NextRequest) {
  if (!(await auth())) return fail("UNAUTHORIZED", "Sign in required", 401);

  const root = await browseRoot();
  const dir = await resolveBrowsePath(req.nextUrl.searchParams.get("path"));
  const info = dir ? await stat(dir).catch(() => null) : null;
  if (!dir || !info?.isDirectory()) return fail("BAD_REQUEST", "Folder not found or not allowed");

  const entries: ImportFileEntry[] = [];
  for (const d of await readdir(dir, { withFileTypes: true })) {
    if (d.name.startsWith(".")) continue;
    const full = path.join(dir, d.name);
    const s = await stat(full).catch(() => null);
    if (!s) continue;
    if (s.isDirectory()) entries.push({ name: d.name, path: full, type: "dir", size: 0, modifiedAt: s.mtime.toISOString() });
    else if (s.isFile()) entries.push({ name: d.name, path: full, type: "file", size: s.size, modifiedAt: s.mtime.toISOString() });
  }
  entries.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "dir" ? -1 : 1));

  return NextResponse.json({
    success: true,
    data: { root, path: dir, parent: dir === root ? null : path.dirname(dir), entries },
  });
}

type ActionBody =
  | { action: "mkdir"; path: string; name: string }
  | { action: "rename"; path: string; name: string }
  | { action: "delete"; path: string };

/** New folder, rename, or delete — always inside the import root, never the root itself. */
export async function POST(req: NextRequest) {
  if (!(await auth())) return fail("UNAUTHORIZED", "Sign in required", 401);

  const root = await browseRoot();
  const body = (await req.json()) as ActionBody;
  const target = await resolveBrowsePath(body.path);
  if (!target) return fail("NOT_FOUND", "Not found or not allowed", 404);

  if (body.action === "mkdir") {
    const name = validEntryName(body.name);
    if (!name) return fail("BAD_REQUEST", "Enter a valid folder name");
    const dest = path.join(target, name);
    if (await exists(dest)) return fail("CONFLICT", `"${name}" already exists`, 409);
    await mkdir(dest);
    return NextResponse.json({ success: true });
  }

  if (target === root) return fail("BAD_REQUEST", "The root folder can't be changed");

  if (body.action === "rename") {
    const name = validEntryName(body.name);
    if (!name) return fail("BAD_REQUEST", "Enter a valid name");
    const dest = path.join(path.dirname(target), name);
    if (dest === target) return NextResponse.json({ success: true });
    if (await exists(dest)) return fail("CONFLICT", `"${name}" already exists`, 409);
    await rename(target, dest);
    return NextResponse.json({ success: true });
  }

  if (body.action === "delete") {
    await rm(target, { recursive: true, force: true });
    return NextResponse.json({ success: true });
  }

  return fail("BAD_REQUEST", "Unknown action");
}
