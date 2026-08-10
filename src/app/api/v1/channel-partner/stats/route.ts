import { getChannelPartnerSection } from "@/lib/channel-partner-section";

export async function GET() {
  return getChannelPartnerSection("stats");
}
