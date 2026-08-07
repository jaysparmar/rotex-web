import { getAboutSection } from "@/lib/about-section";

export async function GET() {
  return getAboutSection("zero-downtime-cta");
}
