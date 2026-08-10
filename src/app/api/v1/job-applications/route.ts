import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10).max(15).regex(/^\d+$/),
  position: z.string().min(1),
  experience: z.string().min(1),
  location: z.string().min(1),
  expectedSalary: z.string().optional(),
  noticePeriod: z.string().optional(),
  message: z.string().min(10),
});

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const parsed = schema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    position: formData.get("position"),
    experience: formData.get("experience"),
    location: formData.get("location"),
    expectedSalary: formData.get("expectedSalary") || undefined,
    noticePeriod: formData.get("noticePeriod") || undefined,
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid application data", 400);
  }

  let resumeUrl: string | undefined;
  const file = formData.get("resume");

  if (file instanceof File && file.size > 0) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return apiError("UNSUPPORTED_TYPE", `Unsupported file type: ${file.type}`, 400);
    }
    if (file.size > MAX_SIZE) {
      return apiError("TOO_LARGE", "Resume exceeds 5MB limit", 400);
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes");
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || "";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    resumeUrl = `/uploads/resumes/${filename}`;
  }

  const application = await prisma.jobApplication.create({
    data: { ...parsed.data, resumeUrl },
  });

  return apiSuccess({ id: application.id }, application.createdAt);
}
