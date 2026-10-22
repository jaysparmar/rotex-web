"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Legacy pages still live at their own fixed routes; everything else renders at the flat /[key] slug.
const LEGACY_PUBLIC_PATH: Record<string, string> = {
  privacy: "/privacy-policy",
  terms: "/terms-and-conditions",
};
// Slugs that would shadow an existing top-level site route if used as a legal page key.
const RESERVED_SLUGS = new Set([
  "products",
  "product",
  "downloads",
  "blogs",
  "case-studies",
  "news-updates",
  "csr",
  "about",
  "contact",
  "join",
  "industries",
  "search",
  "privacy-policy",
  "terms-and-conditions",
  "admin",
  "api",
]);

function publicPathFor(key: string) {
  return LEGACY_PUBLIC_PATH[key] ?? `/${key}`;
}

function revalidateLegal(key: string) {
  revalidatePath("/admin/legal");
  revalidatePath(`/admin/legal/${key}`);
  revalidatePath(publicPathFor(key));
  revalidatePath("/sitemap.xml");
  revalidatePath("/", "layout");
}

export async function createLegalPage(key: string, title: string) {
  if (RESERVED_SLUGS.has(key)) throw new Error("This slug is reserved for an existing page");

  const existing = await prisma.legalPage.findUnique({ where: { key } });
  if (existing) throw new Error("A legal page with this slug already exists");

  await prisma.legalPage.create({ data: { key, title, content: "" } });
  revalidateLegal(key);
}

export async function saveLegalPage(key: string, data: { title: string; content: string }) {
  await prisma.legalPage.upsert({
    where: { key },
    update: data,
    create: { key, ...data },
  });
  revalidateLegal(key);
}

export async function deleteLegalPage(key: string) {
  await prisma.legalPage.delete({ where: { key } });
  revalidateLegal(key);
}
