import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const record = await prisma.globalConfig.findUnique({ where: { id: "global" } });
  const maintenance = (record?.data as PrismaJson.GlobalConfigData | undefined)?.maintenance;
  return NextResponse.json({ enabled: Boolean(maintenance?.enabled) });
}
