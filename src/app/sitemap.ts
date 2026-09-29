import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getPublishedResources } from "@/lib/resources";

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://rotex.ezzystack.com").replace(/\/$/, "");

const STATIC_PATHS = [
  "",
  "/products",
  "/downloads",
  "/blogs",
  "/case-studies",
  "/news-updates",
  "/about",
  "/about/awards",
  "/contact",
  "/join/career",
  "/join/channel-partner",
  "/join/supplier",
  "/privacy-policy",
  "/terms-and-conditions",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, industries, subIndustries, blogs, caseStudies, news] = await Promise.all([
    prisma.product.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.industry.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.subIndustry.findMany({
      select: { slug: true, createdAt: true, industry: { select: { slug: true } } },
    }),
    getPublishedResources("blogs"),
    getPublishedResources("case-studies"),
    getPublishedResources("news"),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/product/${p.slug}`,
    lastModified: p.updatedAt,
  }));

  const industryEntries: MetadataRoute.Sitemap = industries.map((i) => ({
    url: `${BASE_URL}/industries/${i.slug}`,
    lastModified: i.updatedAt,
  }));

  const subIndustryEntries: MetadataRoute.Sitemap = subIndustries.map((s) => ({
    url: `${BASE_URL}/industries/${s.industry.slug}/${s.slug}`,
    lastModified: s.createdAt,
  }));

  const resourceEntries = (
    type: "blogs" | "case-studies" | "news-updates",
    items: { slug: string; createdAt: string }[]
  ): MetadataRoute.Sitemap =>
    items.map((r) => ({ url: `${BASE_URL}/${type}/${r.slug}`, lastModified: new Date(r.createdAt) }));

  return [
    ...staticEntries,
    ...productEntries,
    ...industryEntries,
    ...subIndustryEntries,
    ...resourceEntries("blogs", blogs),
    ...resourceEntries("case-studies", caseStudies),
    ...resourceEntries("news-updates", news),
  ];
}
