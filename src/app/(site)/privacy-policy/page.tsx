import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LegalPageSection } from "@/components/sections/legal-page-section";

export default async function PrivacyPolicyPage() {
  const page = await prisma.legalPage.findUnique({ where: { key: "privacy" } });
  if (!page) notFound();

  return <LegalPageSection title={page.title} content={page.content} />;
}
