import { notFound } from "next/navigation";
import { getSubIndustryDetail } from "@/lib/industries";
import { SubIndustryContent } from "@/components/sections/sub-industry-content";

type Props = { params: Promise<{ sector: string; sub: string }> };

export const dynamic = "force-dynamic";

export default async function IndustrySubPage({ params }: Props) {
  const { sector, sub } = await params;

  const result = await getSubIndustryDetail(sector, sub);
  if (!result) notFound();

  return <SubIndustryContent industry={result.industry} subIndustry={result.subIndustry} />;
}
