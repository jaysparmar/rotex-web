import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { parseDownloadsHtml } from "@/lib/download-html-parser";

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

  if (!/\.html?$/i.test(file.name)) {
    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message: "File must be .html or .htm" } },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { success: false, error: { code: "TOO_LARGE", message: `File exceeds ${MAX_SIZE_MB}MB limit` } },
      { status: 400 }
    );
  }

  const html = await file.text();
  const richGrid = parseDownloadsHtml(html);
  const grid = richGrid.map((row) => row.map((cell) => cell?.text ?? ""));

  return NextResponse.json({ success: true, data: { grid, richGrid } });
}
