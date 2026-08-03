import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { contentTypeFor, resolveUploadPath } from "@/lib/uploads";

export const dynamic = "force-dynamic";

/*
  Serves uploaded media straight off disk.

  Next only serves public/ as it existed at build time, so anything the admin
  uploads afterwards 404s in production even though the file is on the server.
  A rewrite sends /uploads/* here whenever the static handler misses.
*/
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  const filePath = resolveUploadPath(segments);
  if (!filePath) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("not a file");

    const file = await readFile(filePath);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": contentTypeFor(filePath),
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
