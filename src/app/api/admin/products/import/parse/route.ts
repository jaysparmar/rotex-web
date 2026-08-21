import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { auth } from "@/lib/auth";

const MAX_SIZE_MB = 20;
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } },
      { status: 401 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message: "No file provided" } },
      { status: 400 }
    );
  }

  if (!/\.xlsx?$/i.test(file.name)) {
    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message: "File must be .xlsx or .xls" } },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { success: false, error: { code: "TOO_LARGE", message: `File exceeds ${MAX_SIZE_MB}MB limit` } },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheets = workbook.SheetNames.map((name) => ({
    name,
    grid: XLSX.utils.sheet_to_json<string[]>(workbook.Sheets[name], { header: 1, raw: false, defval: "" }),
  }));

  return NextResponse.json({ success: true, data: { sheets } });
}
