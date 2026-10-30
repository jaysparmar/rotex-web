import { NextRequest, NextResponse } from "next/server";
import { createWriteStream } from "fs";
import { rename, stat, truncate, rm } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import type { ReadableStream as NodeReadableStream } from "stream/web";
import { auth } from "@/lib/auth";
import { resolveBrowsePath, validEntryName } from "@/lib/import-files";

export const dynamic = "force-dynamic";

const MAX_CHUNK = 32 * 1024 * 1024;

function fail(code: string, message: string, status = 400, extra?: object) {
  return NextResponse.json({ success: false, error: { code, message, ...extra } }, { status });
}

/** First free name in `dir`: "a.zip", then "a (1).zip", "a (2).zip"… */
async function freeName(dir: string, name: string): Promise<string> {
  const ext = path.extname(name);
  const base = name.slice(0, name.length - ext.length);
  let candidate = name;
  for (let i = 1; await stat(path.join(dir, candidate)).catch(() => null); i++) candidate = `${base} (${i})${ext}`;
  return candidate;
}

/*
  Appends one chunk of a file being uploaded into the import folder. Chunks go to a
  hidden ".<name>.<size>.uploading" file, renamed into place when the last one lands.
  If the client's offset doesn't match what's on disk (a refresh, a retry) the reply
  carries the real offset, so picking the same file again resumes instead of restarting.
*/
export async function PUT(req: NextRequest) {
  if (!(await auth())) return fail("UNAUTHORIZED", "Sign in required", 401);

  const params = req.nextUrl.searchParams;
  const dir = await resolveBrowsePath(params.get("dir"));
  const dirInfo = dir ? await stat(dir).catch(() => null) : null;
  if (!dir || !dirInfo?.isDirectory()) return fail("BAD_REQUEST", "Folder not found or not allowed");

  const name = validEntryName(params.get("name"));
  if (!name) return fail("BAD_REQUEST", "Invalid file name");
  const total = Number(params.get("total"));
  const offset = Number(params.get("offset"));
  if (!Number.isSafeInteger(total) || total < 0 || !Number.isSafeInteger(offset) || offset < 0) {
    return fail("BAD_REQUEST", "Invalid size or offset");
  }

  const partPath = path.join(dir, `.${name}.${total}.uploading`);
  let onDisk = (await stat(partPath).catch(() => null))?.size ?? 0;
  if (onDisk > total) {
    await rm(partPath, { force: true });
    onDisk = 0;
  }
  if (offset !== onDisk) return fail("OFFSET_MISMATCH", "Resume from the server's offset", 409, { uploadedBytes: onDisk });

  let received = 0;
  if (req.body) {
    const body = Readable.fromWeb(req.body as unknown as NodeReadableStream).on("data", (buf: Buffer) => {
      received += buf.length;
      if (received > MAX_CHUNK || offset + received > total) body.destroy(new Error("Chunk too large"));
    });
    try {
      await pipeline(body, createWriteStream(partPath, { flags: "a" }));
    } catch (err) {
      await truncate(partPath, offset).catch(() => {});
      return fail("UPLOAD_FAILED", err instanceof Error ? err.message : "Upload failed");
    }
  } else if (total === 0) {
    await pipeline(Readable.from([]), createWriteStream(partPath, { flags: "a" }));
  }

  const uploadedBytes = offset + received;
  if (uploadedBytes < total) return NextResponse.json({ success: true, data: { uploadedBytes, done: false } });

  const finalName = await freeName(dir, name);
  await rename(partPath, path.join(dir, finalName));
  return NextResponse.json({ success: true, data: { uploadedBytes, done: true, name: finalName } });
}
