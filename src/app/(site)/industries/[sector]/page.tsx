import { notFound } from "next/navigation";
import { getIndustryWithSubIndustries } from "@/lib/industries";
import { SubIndustryContent } from "@/components/sections/sub-industry-content";

type Props = { params: Promise<{ sector: string }> };

export const dynamic = "force-dynamic";

/*
  Landing on the sector itself shows the first sub-sector inline (and its tab
  reads as selected) instead of redirecting into /[sub]. No auto-scroll here —
  the page opens at the top. Scrolling only happens when the URL names a sub.
*/
export default async function IndustryPage({ params }: Props) {
  const { sector } = await params;
  const industry = await getIndustryWithSubIndustries(sector);
  if (!industry) notFound();

  const firstSub = industry.subIndustries[0];
  if (!firstSub) return null;

  return <SubIndustryContent industry={industry} subIndustry={firstSub} />;
}
