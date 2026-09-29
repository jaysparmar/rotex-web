import { prisma } from "@/lib/prisma";

export type ResolvedTag = { id: string; name: string };

export type IndustryOption = { id: string; name: string; subIndustries: { id: string; name: string }[] };

/** Different companies can each have their own same-named Category row (e.g. two
 * "Solenoid Valve" categories with different ids). For resource tagging/filtering we
 * treat same-named categories as one tag — keep only the first id seen per name. */
function dedupeByName<T extends { id: string; name: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (seen.has(item.name)) continue;
    seen.add(item.name);
    result.push(item);
  }
  return result;
}

/** Batches live Category/Industry/SubIndustry lookups once so resolving tags for many
 * resources doesn't N+1 query. "Product tag" means the product Category (Solenoid Valve,
 * Angle Seat Valve, Actuators, Positioners, Automotive Solutions, ...) — not individual
 * Product SKUs. Also exposes the sub-industry -> parent-industry map used to roll
 * sub-industry tags up to their parent for filtering. */
export async function createResourceTagResolver() {
  const [products, industries, subIndustries] = await Promise.all([
    prisma.category.findMany({ select: { id: true, name: true } }),
    prisma.industry.findMany({ select: { id: true, name: true } }),
    prisma.subIndustry.findMany({ select: { id: true, name: true, industryId: true } }),
  ]);

  const productMap = new Map(products.map((p) => [p.id, p.name]));
  const industryMap = new Map(industries.map((i) => [i.id, i.name]));
  const subIndustryNameMap = new Map(subIndustries.map((s) => [s.id, s.name]));
  const subIndustryParentMap = new Map(subIndustries.map((s) => [s.id, s.industryId]));

  function resolveProducts(ids: string[]): ResolvedTag[] {
    const tags = ids
      .map((id) => ({ id, name: productMap.get(id) }))
      .filter((t): t is ResolvedTag => Boolean(t.name));
    return dedupeByName(tags);
  }

  function resolveIndustries(ids: string[]): ResolvedTag[] {
    const tags = ids
      .map((id) => ({ id, name: industryMap.get(id) ?? subIndustryNameMap.get(id) }))
      .filter((t): t is ResolvedTag => Boolean(t.name));
    return dedupeByName(tags);
  }

  return { resolveProducts, resolveIndustries, subIndustryParentMap, industryMap, productMap };
}

export type ResourceTagResolver = Awaited<ReturnType<typeof createResourceTagResolver>>;

export async function getIndustryTreeOptions(): Promise<IndustryOption[]> {
  const industries = await prisma.industry.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, subIndustries: { select: { id: true, name: true }, orderBy: { createdAt: "asc" } } },
  });
  return industries;
}

/** Live Category (product tag) options, one row per name — see dedupeByName. */
export async function getProductCategoryOptions(): Promise<ResolvedTag[]> {
  const categories = await prisma.category.findMany({
    where: { products: { some: {} } },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return dedupeByName(categories);
}

/** Live Category (product tag) + Industry(+SubIndustry) options for the public
 * resource-listing filter UI. */
export async function getResourceFilterOptions(): Promise<{
  products: ResolvedTag[];
  industries: IndustryOption[];
}> {
  const [products, industries] = await Promise.all([getProductCategoryOptions(), getIndustryTreeOptions()]);
  return { products, industries };
}

/** Every free-text extra tag already used on some resource, for the admin "Extra tags"
 * creatable dropdown — suggests existing tags instead of retyping, while still allowing
 * a brand-new one. */
export async function getExistingExtraTags(): Promise<string[]> {
  const records = await prisma.resource.findMany({ select: { extraTags: true } });
  const seen = new Set<string>();
  for (const r of records) {
    for (const tag of (r.extraTags as string[]) ?? []) {
      if (tag) seen.add(tag);
    }
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}
