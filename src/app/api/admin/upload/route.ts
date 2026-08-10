import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { UPLOAD_DIR } from "@/lib/uploads";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "video/mp4",
  "video/webm",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_SIZE_MB = 200;
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: { code: "BAD_REQUEST", message: "No file provided" } }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ success: false, error: { code: "UNSUPPORTED_TYPE", message: `Unsupported file type: ${file.type}` } }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ success: false, error: { code: "TOO_LARGE", message: `File exceeds ${MAX_SIZE_MB}MB limit` } }, { status: 400 });
  }

  const uploadDir = UPLOAD_DIR;
  await mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name) || "";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ success: true, data: { url: `/uploads/${filename}` } });
}
