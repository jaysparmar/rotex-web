import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  analyzeVariableProductImport,
  estimatePendingDownloadLinks,
  type ImportGrid,
  type VariableImportMapping,
} from "@/lib/variable-product-import";
import type { DownloadImportGrid } from "@/lib/download-grid";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 }
    );
  }

  const body = (await req.json()) as {
    grid: ImportGrid;
    richGrid?: DownloadImportGrid;
    mapping: VariableImportMapping;
  };
  const plan = await analyzeVariableProductImport(body.grid, body.mapping);
  const downloads =
    body.mapping.downloads && body.richGrid
      ? estimatePendingDownloadLinks(body.richGrid, body.mapping.downloads)
      : null;

  return NextResponse.json({ success: true, data: { ...plan.summary, downloads } });
}
