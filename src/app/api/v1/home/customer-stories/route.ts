import { getHomeSection } from "@/lib/home-section";

export const dynamic = "force-dynamic";

export async function GET() {
  return getHomeSection("customer-stories");
}
