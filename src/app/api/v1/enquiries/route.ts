import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

const schema = z.object({
  source: z.enum(["industry", "supplier", "contact"]).default("industry"),
  industryName: z.string().min(1),
  fullName: z.string().min(2),
  enquiryType: z.string().min(1),
  product: z.string().min(1),
  phone: z.string().min(10).max(15).regex(/^\d+$/),
  email: z.string().email(),
  country: z.string().min(1),
  city: z.string().min(1),
  company: z.string().optional(),
  designation: z.string().optional(),
  message: z.string().min(10),
});

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const parsed = schema.safeParse({
    source: formData.get("source") || undefined,
    industryName: formData.get("industryName"),
    fullName: formData.get("fullName"),
    enquiryType: formData.get("enquiryType"),
    product: formData.get("product"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    country: formData.get("country"),
    city: formData.get("city"),
    company: formData.get("company") || undefined,
    designation: formData.get("designation") || undefined,
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid enquiry data", 400);
  }

  let fileUrl: string | undefined;
  const file = formData.get("file");

  if (file instanceof File && file.size > 0) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return apiError("UNSUPPORTED_TYPE", `Unsupported file type: ${file.type}`, 400);
    }
    if (file.size > MAX_SIZE) {
      return apiError("TOO_LARGE", "File exceeds 10MB limit", 400);
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "enquiries");
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || "";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    fileUrl = `/uploads/enquiries/${filename}`;
  }

  const enquiry = await prisma.enquiry.create({
    data: { ...parsed.data, fileUrl },
  });

  return apiSuccess({ id: enquiry.id }, enquiry.createdAt);
}
