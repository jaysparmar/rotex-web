
import { prisma } from "@/lib/prisma";

// Fills columns left-to-right in the given order (no shuffling), grouping items by a
// weight so a heavy group (e.g. one with many sub-items) naturally lands alone in its
// own column instead of getting split evenly across columns.
function packByWeight<T>(items: T[], weight: (item: T) => number, parts: number): T[][] {
  const totalWeight = items.reduce((sum, item) => sum + weight(item), 0);
  const target = totalWeight / parts;
  const columns: T[][] = [];
  let current: T[] = [];
  let currentWeight = 0;

  for (const item of items) {
    const itemWeight = weight(item);
    if (currentWeight > 0 && currentWeight + itemWeight > target * 1.15 && columns.length < parts - 1) {
      columns.push(current);
      current = [];
      currentWeight = 0;
    }
    current.push(item);
    currentWeight += itemWeight;
  }
  columns.push(current);
  return columns;
}

async function resolveIndustriesMenu(source: PrismaJson.MegaMenuSource): Promise<PrismaJson.FlatMenu> {
  const industries = await prisma.industry.findMany({
    where: { id: { in: source.selectedIds } },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      subIndustries: { select: { id: true, name: true, slug: true } },
    },
  });

  // Preserve the order the admin picked things in (selectedIds order), not DB/alphabetical order.
  const byOrder = (aId: string, bId: string) => source.selectedIds.indexOf(aId) - source.selectedIds.indexOf(bId);
  const orderedIndustries = [...industries].sort((a, b) => byOrder(a.id, b.id));

  const groups: PrismaJson.FlatGroup[] = orderedIndustries.map((industry) => ({
    heading: industry.name,
    href: `/industries/${industry.slug}`,
    image: industry.image ?? undefined,
    items: industry.subIndustries
      .filter((sub) => source.selectedIds.includes(sub.id))
      .sort((a, b) => byOrder(a.id, b.id))
      .map((sub) => ({ label: sub.name, href: `/industries/${industry.slug}/${sub.slug}` })),
  }));

  const columns: PrismaJson.FlatColumn[] = packByWeight(groups, (g) => 1 + (g.items?.length ?? 0), 3).map(
    (groupChunk) => ({ groups: groupChunk })
  );

  return {
    type: "flat",
    columns,
    image: source.image,
    imageCaption: source.imageCaption,
    cta: source.cta,
  };
}

async function resolveProductsMenu(source: PrismaJson.MegaMenuSource): Promise<PrismaJson.CategorySwitcherMenu> {
  const rows = await prisma.category.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  });
  const categories = rows
    .map((r) => r.name)
    .filter((c) => source.selectedIds.includes(c))
    .map((label) => ({ label, items: [] }));

  return {
    type: "category-switcher",
    categories,
    cta: source.cta ?? { text: "Talk to experts to choose the right product", href: "/contact" },
  };
}

async function resolveFeaturedBlog(menu: PrismaJson.FlatMenu): Promise<PrismaJson.FlatMenu> {
  if (!menu.featuredBlogSlug) return menu;
  const blog = await prisma.resource.findFirst({
    where: { type: "blogs", slug: menu.featuredBlogSlug, published: true },
    select: { slug: true, title: true, image: true },
  });
  if (!blog) return menu;
  return { ...menu, image: blog.image, imageCaption: blog.title, imageHref: `/blogs/${blog.slug}` };
}

export async function resolveNavItems(nav: PrismaJson.NavItem[]): Promise<PrismaJson.NavItem[]> {
  return Promise.all(
    nav.map(async (item) => {
      if (item.megaMenuSource) {
        const megaMenu =
          item.megaMenuSource.type === "industries"
            ? await resolveIndustriesMenu(item.megaMenuSource)
            : await resolveProductsMenu(item.megaMenuSource);
        return { ...item, megaMenu };
      }
      if (item.megaMenu?.type === "flat" && item.megaMenu.featuredBlogSlug) {
        return { ...item, megaMenu: await resolveFeaturedBlog(item.megaMenu) };
      }
      return item;
    })
  );
}

async function resolveFooterIndustriesLinks(source: PrismaJson.FooterColumnSource): Promise<PrismaJson.FooterLink[]> {
  const industries = await prisma.industry.findMany({
    where: { id: { in: source.selectedIds } },
    select: { name: true, slug: true },
    // Match the canonical industry order used by the admin list and /api/v1/industries.
    orderBy: { createdAt: "asc" },
  });
  return industries.map((industry) => ({ label: industry.name, href: `/industries/${industry.slug}` }));
}

export async function resolveFooterColumns(columns: PrismaJson.FooterColumn[]): Promise<PrismaJson.FooterColumn[]> {
  return Promise.all(
    columns.map(async (column) => {
      if (!column.source) return column;
      const links =
        column.source.type === "industries" ? await resolveFooterIndustriesLinks(column.source) : column.links;
      return { ...column, links };
    })
  );
}

export async function getResolvedGlobalConfig(): Promise<PrismaJson.GlobalConfigData> {
  const record = await prisma.globalConfig.findUniqueOrThrow({ where: { id: "global" } });
  const config = record.data as PrismaJson.GlobalConfigData;
  const nav = await resolveNavItems(config.header.nav);
  const columns = await resolveFooterColumns(config.footer.columns);
  return { ...config, header: { ...config.header, nav }, footer: { ...config.footer, columns } };
}
