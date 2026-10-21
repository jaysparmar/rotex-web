import { prisma } from "@/lib/prisma";

const DEFAULT_ADMIN_CONFIG: PrismaJson.AdminConfigData = {
  sidebarLogoLight: "/logo.svg",
  sidebarLogoDark: "/logo.svg",
  fallbackPlaceholderImage: "/logo.svg",
};

export async function getAdminConfig(): Promise<PrismaJson.AdminConfigData> {
  const record = await prisma.adminConfig.findUnique({ where: { id: "admin" } });
  return (record?.data as PrismaJson.AdminConfigData | undefined) ?? DEFAULT_ADMIN_CONFIG;
}
