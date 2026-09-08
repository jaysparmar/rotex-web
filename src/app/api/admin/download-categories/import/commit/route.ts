import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { analyzeDownloadImport, applyDownloadImportPlan, type DownloadImportMapping } from "@/lib/download-import";
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
  const result = await applyDownloadImportPlan(plan);
  revalidatePath("/admin/download-categories");
  revalidatePath("/admin/products");
  return NextResponse.json({ success: true, data: { ...plan.summary, ...result } });
}
