import { redirect, notFound } from "next/navigation";
import { getIndustryWithSubIndustries } from "@/lib/industries";

type Props = { params: Promise<{ sector: string }> };

export const dynamic = "force-dynamic";

export default async function IndustryPage({ params }: Props) {
  const { sector } = await params;
  const industry = await getIndustryWithSubIndustries(sector);
  if (!industry) notFound();

  const firstSub = industry.subIndustries[0];
  if (!firstSub) return null;

  redirect(`/industries/${sector}/${firstSub.slug}`);
}
