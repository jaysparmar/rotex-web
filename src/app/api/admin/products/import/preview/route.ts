import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeVariableProductImport, type ImportGrid, type VariableImportMapping } from "@/lib/variable-product-import";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 }
    );
  }

  const body = (await req.json()) as { grid: ImportGrid; mapping: VariableImportMapping };
  const plan = await analyzeVariableProductImport(body.grid, body.mapping);
  return NextResponse.json({ success: true, data: plan.summary });
}
