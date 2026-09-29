import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { LegalPageSection } from "@/components/sections/legal-page-section";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getPageSeo("terms-and-conditions"), SITE_METADATA_FALLBACK);
}

export default async function TermsAndConditionsPage() {
  const page = await prisma.legalPage.findUnique({ where: { key: "terms" } });
  if (!page) notFound();

  const seo = await getPageSeo("terms-and-conditions");

  return (
    <>
      <SeoJsonLd schema={seo.schema} />
      <LegalPageSection title={page.title} content={page.content} />
    </>
  );
}
