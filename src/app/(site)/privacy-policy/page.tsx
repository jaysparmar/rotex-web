import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { LegalPageSection } from "@/components/sections/legal-page-section";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getPageSeo("privacy-policy"), SITE_METADATA_FALLBACK);
}

export default async function PrivacyPolicyPage() {
  const page = await prisma.legalPage.findUnique({ where: { key: "privacy" } });
  if (!page) notFound();

  const seo = await getPageSeo("privacy-policy");

  return (
    <>
      <SeoJsonLd schema={seo.schema} />
      <LegalPageSection title={page.title} content={page.content} />
    </>
  );
}
