import "server-only";
import { prisma } from "@/lib/prisma";

const FALLBACK_PASSWORD = "Rotex@2626";

/*
  Resolves the Partner Sales Tools gate password. Server-only — this must never
  reach the client bundle, which is why the check lives behind an API route
  rather than comparing in the browser.

  Precedence: PARTNER_TOOLS_PASSWORD env → GlobalConfig.partnerTools → seed default.
*/
export async function getPartnerToolsPassword(): Promise<string> {
  if (process.env.PARTNER_TOOLS_PASSWORD) return process.env.PARTNER_TOOLS_PASSWORD;

  const record = await prisma.globalConfig.findUnique({ where: { id: "global" } });
  const config = record?.data as PrismaJson.GlobalConfigData | undefined;

  return config?.partnerTools?.password ?? FALLBACK_PASSWORD;
}

export async function verifyPartnerToolsPassword(candidate: string): Promise<boolean> {
  const expected = await getPartnerToolsPassword();
  return candidate === expected;
}
