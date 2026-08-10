import { getPartnerToolsSection } from "@/lib/partner-tools-section";

export async function GET() {
  return getPartnerToolsSection("tools");
}
