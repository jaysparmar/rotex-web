import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeDownloadImport, type DownloadImportMapping } from "@/lib/download-import";
import type { DownloadImportGrid } from "@/lib/download-grid";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 }
    );
  }

  const body = (await req.json()) as { grid: DownloadImportGrid; mapping: DownloadImportMapping };
  const plan = await analyzeDownloadImport(body.grid, body.mapping);
  return NextResponse.json({ success: true, data: plan.summary });
}
