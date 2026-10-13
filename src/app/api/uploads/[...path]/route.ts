import { NextResponse } from "next/server";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import { contentTypeFor, resolveUploadPath } from "@/lib/uploads";

export const dynamic = "force-dynamic";

/*
  Serves uploaded media straight off disk.

  Next only serves public/ as it existed at build time, so anything the admin
  uploads afterwards 404s in production even though the file is on the server.
  A rewrite sends /uploads/* here whenever the static handler misses.

  Supports HTTP Range requests (206 Partial Content) — without this, a <video>
  tag can't start playing until the *entire* file has downloaded, since the
  browser has no way to fetch just the first chunk or seek ahead. That's what
  made video playback across the site feel slow to start, especially on
  anything but a short clip.
*/
export async function GET(
  req: Request,
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

    const contentType = contentTypeFor(filePath);
    const baseHeaders = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Accept-Ranges": "bytes",
      // Explicit "inline" so the View link opens in-tab for browser-renderable
      // types (PDF/image). Non-renderable types (docx/xlsx/...) still force a
      // save regardless — that's the browser, not this header.
      "Content-Disposition": "inline",
    };

    const range = req.headers.get("range");
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      const start = match?.[1] ? Number(match[1]) : 0;
      const end = match?.[2] ? Number(match[2]) : info.size - 1;

      if (!match || start > end || end >= info.size) {
        return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${info.size}` } });
      }

      const stream = createReadStream(filePath, { start, end });
      return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
        status: 206,
        headers: {
          ...baseHeaders,
          "Content-Range": `bytes ${start}-${end}/${info.size}`,
          "Content-Length": String(end - start + 1),
        },
      });
    }

    const stream = createReadStream(filePath);
    return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
      headers: { ...baseHeaders, "Content-Length": String(info.size) },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
