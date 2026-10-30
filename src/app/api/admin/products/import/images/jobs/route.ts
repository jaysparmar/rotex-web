import { NextRequest, NextResponse } from "next/server";
import { stat } from "fs/promises";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  distinctReferences,
  resolveBrowsePath,
  startImageJob,
  toImageJobDTO,
  uploadZipPath,
} from "@/lib/image-import-job";

export const dynamic = "force-dynamic";

function fail(code: string, message: string, status = 400) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

/** Latest jobs, newest first — lets the import page restore its progress bar after a refresh. */
export async function GET() {
  const session = await auth();
  if (!session) return fail("UNAUTHORIZED", "Sign in required", 401);

  const jobs = await prisma.imageImportJob.findMany({ orderBy: { createdAt: "desc" }, take: 5 });
  return NextResponse.json({ success: true, data: jobs.map(toImageJobDTO) });
}

type CreateBody =
  | { sourceType: "server"; serverPath: string; references: string[] }
  | { sourceType: "upload"; fileName: string; totalBytes: number; references: string[] };

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return fail("UNAUTHORIZED", "Sign in required", 401);

  const body = (await req.json()) as CreateBody;
  const references = distinctReferences(Array.isArray(body.references) ? body.references.map(String) : []);
  if (references.length === 0) return fail("BAD_REQUEST", "The selected image column has no image paths");

  if (body.sourceType === "server") {
    const zipPath = await resolveBrowsePath(body.serverPath);
    if (!zipPath || !/\.zip$/i.test(zipPath)) return fail("BAD_REQUEST", "Pick a .zip file inside the allowed folder");
    const info = await stat(zipPath).catch(() => null);
    if (!info?.isFile()) return fail("NOT_FOUND", "Zip file not found");

    const job = await prisma.imageImportJob.create({
      data: {
        status: "queued",
        sourceType: "server",
        zipPath,
        originalName: zipPath.split("/").pop() ?? zipPath,
        totalBytes: info.size,
        uploadedBytes: info.size,
        references,
        totalItems: references.length,
      },
    });
    startImageJob(job.id);
    return NextResponse.json({ success: true, data: toImageJobDTO(job) });
  }

  if (body.sourceType === "upload") {
    if (!/\.zip$/i.test(body.fileName ?? "")) return fail("BAD_REQUEST", "File must be a .zip");
    const totalBytes = Number(body.totalBytes);
    if (!Number.isFinite(totalBytes) || totalBytes <= 0) return fail("BAD_REQUEST", "Invalid file size");

    const job = await prisma.imageImportJob.create({
      data: {
        status: "uploading",
        sourceType: "upload",
        zipPath: "",
        originalName: body.fileName,
        totalBytes,
        references,
        totalItems: references.length,
      },
    });
    const updated = await prisma.imageImportJob.update({
      where: { id: job.id },
      data: { zipPath: uploadZipPath(job.id) },
    });
    return NextResponse.json({ success: true, data: toImageJobDTO(updated) });
  }

  return fail("BAD_REQUEST", "Unknown source type");
}
