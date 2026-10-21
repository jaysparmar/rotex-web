import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { LegalPageSection } from "@/components/sections/legal-page-section";
import { getPageSeo, buildMetadata, SITE_METADATA_FALLBACK } from "@/lib/seo";
import { SeoJsonLd } from "@/components/seo/seo-json-ld";

// "privacy" and "terms" live at their own dedicated routes — redirect here rather
// than rendering the same content at a second URL.
const LEGACY_REDIRECT: Record<string, string> = {
  privacy: "/privacy-policy",
  terms: "/terms-and-conditions",
};

type Props = { params: Promise<{ legalSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { legalSlug } = await params;
  return buildMetadata(await getPageSeo(`legal-${legalSlug}`), SITE_METADATA_FALLBACK);
}

export default async function LegalPage({ params }: Props) {
  const { legalSlug } = await params;
  if (LEGACY_REDIRECT[legalSlug]) redirect(LEGACY_REDIRECT[legalSlug]);

  const page = await prisma.legalPage.findUnique({ where: { key: legalSlug } });
  if (!page) notFound();

  const seo = await getPageSeo(`legal-${legalSlug}`);

  return (
    <>
      <SeoJsonLd schema={seo.schema} />
      <LegalPageSection title={page.title} content={page.content} />
    </>
  );
}
