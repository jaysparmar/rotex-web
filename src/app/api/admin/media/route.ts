import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type");
  const assets = await prisma.mediaAsset.findMany({
    where: type ? { type } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: assets });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 });
  }

  const body = await req.json();
  const { url, type, filename, alt } = body as { url?: string; type?: string; filename?: string; alt?: string };

  if (!url || !type || !filename) {
    return NextResponse.json({ success: false, error: { code: "BAD_REQUEST", message: "url, type, and filename are required" } }, { status: 400 });
  }

  const asset = await prisma.mediaAsset.create({
    data: { url, type, filename, alt: alt ?? null },
  });

  return NextResponse.json({ success: true, data: asset });
}
