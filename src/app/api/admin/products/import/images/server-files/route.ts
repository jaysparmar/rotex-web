import { NextRequest, NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { browseRoot, resolveBrowsePath } from "@/lib/image-import-job";

export const dynamic = "force-dynamic";

export type ServerFileEntry = { name: string; path: string; type: "dir" | "zip"; size: number; modifiedAt: string };

/** Lists sub-folders and .zip files in one folder under IMPORT_BROWSE_ROOT. */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 });
  }

  const root = await browseRoot();
  const dir = await resolveBrowsePath(req.nextUrl.searchParams.get("path"));
  const info = dir ? await stat(dir).catch(() => null) : null;
  if (!dir || !info?.isDirectory()) {
    return NextResponse.json({ success: false, error: { code: "BAD_REQUEST", message: "Folder not found or not allowed" } }, { status: 400 });
  }

  const dirents = await readdir(dir, { withFileTypes: true });
  const entries: ServerFileEntry[] = [];
  for (const d of dirents) {
    if (d.name.startsWith(".") || d.name === "node_modules") continue;
    const full = path.join(dir, d.name);
    const s = await stat(full).catch(() => null);
    if (!s) continue;
    if (s.isDirectory()) {
      entries.push({ name: d.name, path: full, type: "dir", size: 0, modifiedAt: s.mtime.toISOString() });
    } else if (s.isFile() && /\.zip$/i.test(d.name)) {
      entries.push({ name: d.name, path: full, type: "zip", size: s.size, modifiedAt: s.mtime.toISOString() });
    }
  }
  entries.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "dir" ? -1 : 1));

  return NextResponse.json({
    success: true,
    data: { root, path: dir, parent: dir === root ? null : path.dirname(dir), entries },
  });
}
