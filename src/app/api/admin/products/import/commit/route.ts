import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  analyzeVariableProductImport,
  applyVariableProductImportPlan,
  deriveDownloadTargetColumns,
  type ImportGrid,
  type VariableImportMapping,
} from "@/lib/variable-product-import";
import { analyzeDownloadImport, applyDownloadImportPlan } from "@/lib/download-import";
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
  const result = await applyVariableProductImportPlan(plan);

  let downloadsResult: { createdCategoryCount: number; updatedTargetCount: number; addedEntryCount: number } | null =
    null;
  if (body.mapping.downloads && body.richGrid) {
    const targetColumns = deriveDownloadTargetColumns(body.mapping);
    if (targetColumns) {
      // Every Model Number this sheet references now exists (either reused or just created
      // above), so the existing, unmodified downloads pipeline can resolve every target.
      const downloadPlan = await analyzeDownloadImport(body.richGrid, {
        modelNumberColumn: targetColumns.modelNumberColumn,
        attributeColumns: targetColumns.attributeColumns,
        bannerRow: body.mapping.downloads.bannerRow,
        categories: body.mapping.downloads.categories,
      });
      downloadsResult = await applyDownloadImportPlan(downloadPlan);
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/attributes");
  revalidatePath("/admin/download-categories");
  revalidatePath("/downloads");

  return NextResponse.json({
    success: true,
    data: { ...plan.summary, ...result, ...(downloadsResult ?? {}) },
  });
}
