import { cache } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export type SeoMetaData = PrismaJson.SeoMetaData;

export const SITE_METADATA_FALLBACK = {
  title: "Rotex | Industrial Solutions",
  description: "Leading provider of industrial rotary solutions and equipment",
};

export const SEO_PAGES: { key: string; label: string; path: string }[] = [
  { key: "home", label: "Home", path: "/" },
  { key: "products", label: "Products", path: "/products" },
  { key: "downloads", label: "Downloads", path: "/downloads" },
  { key: "blogs", label: "Blogs", path: "/blogs" },
  { key: "case-studies", label: "Case Studies", path: "/case-studies" },
  { key: "news-updates", label: "News & Updates", path: "/news-updates" },
  { key: "about", label: "About", path: "/about" },
  { key: "about-awards", label: "Awards", path: "/about/awards" },
  { key: "contact", label: "Contact", path: "/contact" },
  { key: "join-career", label: "Careers", path: "/join/career" },
  { key: "join-channel-partner", label: "Channel Partner", path: "/join/channel-partner" },
  { key: "join-partner-sales-tools", label: "Partner Sales Tools", path: "/join/partner-sales-tools" },
  { key: "join-supplier", label: "Supplier", path: "/join/supplier" },
  { key: "privacy-policy", label: "Privacy Policy", path: "/privacy-policy" },
  { key: "terms-and-conditions", label: "Terms & Conditions", path: "/terms-and-conditions" },
  { key: "search", label: "Search Results", path: "/search" },
];

function defaultSeoMeta(key: string): SeoMetaData {
  return {
    title: "",
    description: "",
    keywords: [],
    ogImage: { src: "", alt: "" },
    canonical: "",
    noindex: key === "search",
    schema: "",
  };
}

export const getPageSeo = cache(async (key: string): Promise<SeoMetaData> => {
  const row = await prisma.seoPage.upsert({
    where: { key },
    update: {},
    create: { key, data: defaultSeoMeta(key) as never },
  });
  return row.data as SeoMetaData;
});

export function buildMetadata(seo: SeoMetaData, fallback: { title: string; description: string }): Metadata {
  const title = seo.title.trim() || fallback.title;
  const description = seo.description.trim() || fallback.description;

  const metadata: Metadata = {
    title,
    description,
    robots: seo.noindex ? { index: false, follow: false } : { index: true, follow: true },
  };

  if (seo.keywords.length > 0) metadata.keywords = seo.keywords;
  if (seo.canonical.trim()) metadata.alternates = { canonical: seo.canonical.trim() };
  if (seo.ogImage.src.trim()) {
    metadata.openGraph = { images: [{ url: seo.ogImage.src, alt: seo.ogImage.alt || title }] };
  }

  return metadata;
}
