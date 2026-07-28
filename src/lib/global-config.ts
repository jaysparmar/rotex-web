
import { prisma } from "@/lib/prisma";

function chunk<T>(items: T[], parts: number): T[][] {
  const result: T[][] = Array.from({ length: parts }, () => []);
  items.forEach((item, i) => result[i % parts].push(item));
  return result;
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
    orderBy: { name: "asc" },
  });

  const groups: PrismaJson.FlatGroup[] = industries.map((industry) => ({
    heading: industry.name,
    href: `/industries/${industry.slug}`,
    image: industry.image ?? undefined,
    items: industry.subIndustries
      .filter((sub) => source.selectedIds.includes(sub.id))
      .map((sub) => ({ label: sub.name, href: `/industries/${industry.slug}/${sub.slug}` })),
  }));

  const columns: PrismaJson.FlatColumn[] = chunk(groups, 3).map((groupChunk) => ({ groups: groupChunk }));

  return {
    type: "flat",
    columns,
    image: source.image,
    imageCaption: source.imageCaption,
    cta: source.cta,
  };
}

async function resolveProductsMenu(source: PrismaJson.MegaMenuSource): Promise<PrismaJson.CategorySwitcherMenu> {
  const rows = await prisma.product.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });
  const categories = rows
    .map((r) => r.category)
    .filter((c) => source.selectedIds.includes(c))
    .map((label) => ({ label, items: [] }));

  return {
    type: "category-switcher",
    categories,
    cta: source.cta ?? { text: "Talk to experts to choose the right product", href: "/contact" },
  };
}

export async function resolveNavItems(nav: PrismaJson.NavItem[]): Promise<PrismaJson.NavItem[]> {
  return Promise.all(
    nav.map(async (item) => {
      if (!item.megaMenuSource) return item;
      const megaMenu =
        item.megaMenuSource.type === "industries"
          ? await resolveIndustriesMenu(item.megaMenuSource)
          : await resolveProductsMenu(item.megaMenuSource);
      return { ...item, megaMenu };
    })
  );
}

async function resolveFooterIndustriesLinks(source: PrismaJson.FooterColumnSource): Promise<PrismaJson.FooterLink[]> {
  const industries = await prisma.industry.findMany({
    where: { id: { in: source.selectedIds } },
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
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
