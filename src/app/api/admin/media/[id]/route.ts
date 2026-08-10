import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 });
  }

  const { id } = await params;
  await prisma.mediaAsset.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
