import { getCareerSection } from "@/lib/career-section";

export async function GET() {
  return getCareerSection("why");
}
