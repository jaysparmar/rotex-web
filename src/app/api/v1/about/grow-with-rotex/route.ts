import { getAboutSection } from "@/lib/about-section";

export async function GET() {
  return getAboutSection("grow-with-rotex");
}
