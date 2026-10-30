import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureImageJobRunning, toImageJobDTO } from "@/lib/image-import-job";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 });
  }

  const { id } = await params;
  const job = await prisma.imageImportJob.findUnique({ where: { id } });
  if (!job) {
    return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Image job not found" } }, { status: 404 });
  }

  ensureImageJobRunning(job);
  return NextResponse.json({ success: true, data: toImageJobDTO(job) });
}
