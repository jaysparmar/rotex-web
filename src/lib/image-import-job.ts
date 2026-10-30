import "server-only";
import path from "path";
import { createWriteStream } from "fs";
import { mkdir, rename, rm, stat } from "fs/promises";
import { pipeline } from "stream/promises";
import yauzl from "yauzl";
import { prisma } from "@/lib/prisma";
import { UPLOAD_DIR } from "@/lib/uploads";
import { normalizeRef, type ImageJobDTO, type ImageJobStatus } from "@/lib/image-import-job-types";

export { distinctReferences, normalizeRef } from "@/lib/image-import-job-types";
export type { ImageJobDTO } from "@/lib/image-import-job-types";
export { browseRoot, resolveBrowsePath } from "@/lib/import-files";

/*
  Background job that copies the images an import sheet references out of a zip
  (uploaded by the admin, or picked from a folder on the server) into the uploads
  dir. Progress lives in the ImageImportJob table, so a browser refresh only needs
  the job id to pick the progress bar back up.
*/

/** Where browser-uploaded zips are staged while they upload and extract. Not public. */
export const IMPORT_TMP_DIR = process.env.IMPORT_TMP_DIR ?? path.join(process.cwd(), ".import-tmp");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);

type EntryIndex = {
  full: Map<string, yauzl.Entry>;
  withoutRoot: Map<string, yauzl.Entry>;
  byBasename: Map<string, yauzl.Entry | null>; // null = ambiguous
};

function indexEntries(entries: yauzl.Entry[]): EntryIndex {
  const index: EntryIndex = { full: new Map(), withoutRoot: new Map(), byBasename: new Map() };
  for (const entry of entries) {
    const key = normalizeRef(entry.fileName);
    index.full.set(key, entry);
    const slash = key.indexOf("/");
    if (slash > 0) index.withoutRoot.set(key.slice(slash + 1), entry);
    const base = key.slice(key.lastIndexOf("/") + 1);
    index.byBasename.set(base, index.byBasename.has(base) ? null : entry);
  }
  return index;
}

function findEntry(index: EntryIndex, ref: string): yauzl.Entry | null {
  const key = normalizeRef(ref);
  if (!key) return null;
  return (
    index.withoutRoot.get(key) ??
    index.full.get(key) ??
    index.byBasename.get(key.slice(key.lastIndexOf("/") + 1)) ??
    null
  );
}

function sanitizeSegment(seg: string): string {
  const cleaned = seg
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|-+$/g, "");
  return cleaned || "file";
}

/** Disk path + public URL for one extracted entry, keeping the zip's folder layout. */
function destinationFor(jobId: string, entryName: string): { filePath: string; url: string } {
  const parts = entryName.replace(/\\/g, "/").split("/").filter(Boolean);
  const last = parts.length - 1;
  const segments = parts.map((p, i) => {
    if (i !== last) return sanitizeSegment(p);
    const ext = path.extname(p).toLowerCase();
    return sanitizeSegment(path.basename(p, path.extname(p))) + ext;
  });
  const rel = ["variant-images", jobId, ...segments];
  return { filePath: path.join(UPLOAD_DIR, ...rel), url: "/uploads/" + rel.map(encodeURIComponent).join("/") };
}

function readAllEntries(zip: yauzl.ZipFile): Promise<yauzl.Entry[]> {
  return new Promise((resolve, reject) => {
    const entries: yauzl.Entry[] = [];
    zip.on("entry", (entry: yauzl.Entry) => {
      if (!entry.fileName.endsWith("/")) entries.push(entry);
      zip.readEntry();
    });
    zip.once("end", () => resolve(entries));
    zip.once("error", reject);
    zip.readEntry();
  });
}

async function fileSize(p: string): Promise<number | null> {
  try {
    return (await stat(p)).size;
  } catch {
    return null;
  }
}

async function extractJob(jobId: string): Promise<void> {
  const job = await prisma.imageImportJob.findUnique({ where: { id: jobId } });
  if (!job || (job.status !== "queued" && job.status !== "extracting")) return;

  const references = job.references as string[];
  await prisma.imageImportJob.update({
    where: { id: jobId },
    data: { status: "extracting", totalItems: references.length, processedItems: 0, error: null },
  });

  const zip = await yauzl.openPromise(job.zipPath, { lazyEntries: true, autoClose: false });
  try {
    const index = indexEntries(await readAllEntries(zip));
    const resolved: Record<string, string> = {};
    const missing: string[] = [];
    let copied = 0;
    let lastFlush = 0;

    for (let i = 0; i < references.length; i++) {
      const ref = references[i];
      const entry = findEntry(index, ref);
      const ext = entry ? path.extname(entry.fileName).toLowerCase() : "";

      if (!entry || !IMAGE_EXTENSIONS.has(ext)) {
        missing.push(ref);
      } else {
        const { filePath, url } = destinationFor(jobId, entry.fileName);
        // Already copied by an earlier run of this job (e.g. before a server restart).
        if ((await fileSize(filePath)) !== entry.uncompressedSize) {
          await mkdir(path.dirname(filePath), { recursive: true });
          const tmp = `${filePath}.part`;
          await pipeline(await zip.openReadStreamPromise(entry), createWriteStream(tmp));
          await rm(filePath, { force: true });
          await rename(tmp, filePath);
        }
        resolved[normalizeRef(ref)] = url;
        copied++;
      }

      const now = Date.now();
      if (now - lastFlush > 400 || i === references.length - 1) {
        lastFlush = now;
        await prisma.imageImportJob.update({
          where: { id: jobId },
          data: { processedItems: i + 1, copiedCount: copied, resolved, missing },
        });
      }
    }

    await prisma.imageImportJob.update({
      where: { id: jobId },
      data: { status: "done", processedItems: references.length, copiedCount: copied, resolved, missing },
    });
  } finally {
    zip.close();
  }

  // Uploaded zips were only staged for this job; server-picked zips are the admin's own files.
  if (job.sourceType === "upload") await rm(job.zipPath, { force: true });
}

// Survives dev hot-reloads; in production there's one long-lived `next start` process.
const globalForJobs = globalThis as unknown as { imageImportJobs?: Map<string, Promise<void>> };
const running = (globalForJobs.imageImportJobs ??= new Map());

/** Starts the job in the background unless this process is already running it. */
export function startImageJob(jobId: string): void {
  if (running.has(jobId)) return;
  const task = extractJob(jobId)
    .catch(async (err) => {
      console.error(`[image-import-job] ${jobId} failed`, err);
      await prisma.imageImportJob
        .update({
          where: { id: jobId },
          data: { status: "failed", error: err instanceof Error ? err.message : String(err) },
        })
        .catch(() => {});
    })
    .finally(() => running.delete(jobId));
  running.set(jobId, task);
}

/**
 * Called when the browser polls: a job the DB says is in progress but that no
 * code is running (the server restarted mid-extraction) gets picked back up.
 */
export function ensureImageJobRunning(job: { id: string; status: string }): void {
  if ((job.status === "queued" || job.status === "extracting") && !running.has(job.id)) {
    startImageJob(job.id);
  }
}

export function uploadZipPath(jobId: string): string {
  return path.join(IMPORT_TMP_DIR, `${jobId}.zip`);
}

export function toImageJobDTO(job: {
  id: string;
  status: string;
  sourceType: string;
  originalName: string;
  totalBytes: number;
  uploadedBytes: number;
  totalItems: number;
  processedItems: number;
  copiedCount: number;
  missing: unknown;
  error: string | null;
  createdAt: Date;
}): ImageJobDTO {
  return {
    id: job.id,
    status: job.status as ImageJobStatus,
    sourceType: job.sourceType as "upload" | "server",
    originalName: job.originalName,
    totalBytes: job.totalBytes,
    uploadedBytes: job.uploadedBytes,
    totalItems: job.totalItems,
    processedItems: job.processedItems,
    copiedCount: job.copiedCount,
    missing: (job.missing as string[]) ?? [],
    error: job.error,
    createdAt: job.createdAt.toISOString(),
  };
}
