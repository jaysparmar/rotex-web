import { NextRequest, NextResponse } from "next/server";
import { createWriteStream } from "fs";
import { mkdir, stat, truncate } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import type { ReadableStream as NodeReadableStream } from "stream/web";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startImageJob, toImageJobDTO } from "@/lib/image-import-job";

export const dynamic = "force-dynamic";

/** Largest chunk accepted — the client sends 8MB; this leaves headroom under nginx's body limit. */
const MAX_CHUNK = 32 * 1024 * 1024;

function fail(code: string, message: string, status = 400, extra?: object) {
  return NextResponse.json({ success: false, error: { code, message, ...extra } }, { status });
}

/*
  Appends one chunk of a browser-uploaded zip. The client sends the byte offset it
  thinks it's at; if that doesn't match what's on disk (e.g. after a refresh) we
  reply with the real offset so it can resume from there.
*/
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return fail("UNAUTHORIZED", "Sign in required", 401);

  const { id } = await params;
  const job = await prisma.imageImportJob.findUnique({ where: { id } });
  if (!job || job.sourceType !== "upload") return fail("NOT_FOUND", "Upload job not found", 404);
  if (job.status !== "uploading") return fail("CONFLICT", "This upload is already complete", 409);

  // The file on disk is the source of truth; drop any partial tail from an interrupted chunk.
  await mkdir(path.dirname(job.zipPath), { recursive: true });
  const onDisk = (await stat(job.zipPath).catch(() => null))?.size ?? 0;
  if (onDisk !== job.uploadedBytes) {
    if (onDisk > job.uploadedBytes) await truncate(job.zipPath, job.uploadedBytes);
    else await prisma.imageImportJob.update({ where: { id }, data: { uploadedBytes: onDisk } });
  }
  const committed = Math.min(onDisk, job.uploadedBytes);

  const offset = Number(req.nextUrl.searchParams.get("offset"));
  if (offset !== committed) {
    return fail("OFFSET_MISMATCH", "Resume from the server's offset", 409, { uploadedBytes: committed });
  }
  if (!req.body) return fail("BAD_REQUEST", "Empty chunk");

  let received = 0;
  const limited = Readable.fromWeb(req.body as unknown as NodeReadableStream).on("data", (buf: Buffer) => {
    received += buf.length;
    if (received > MAX_CHUNK || committed + received > job.totalBytes) {
      limited.destroy(new Error("Chunk too large"));
    }
  });
  try {
    await pipeline(limited, createWriteStream(job.zipPath, { flags: "a" }));
  } catch (err) {
    await truncate(job.zipPath, committed).catch(() => {});
    return fail("UPLOAD_FAILED", err instanceof Error ? err.message : "Upload failed");
  }

  const uploadedBytes = committed + received;
  const done = uploadedBytes >= job.totalBytes;
  const updated = await prisma.imageImportJob.update({
    where: { id },
    data: { uploadedBytes, ...(done ? { status: "queued" } : {}) },
  });
  if (done) startImageJob(id);

  return NextResponse.json({ success: true, data: toImageJobDTO(updated) });
}
