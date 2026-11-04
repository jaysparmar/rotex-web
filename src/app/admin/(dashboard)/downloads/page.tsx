import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { ProductDownloadList, type AdminDownloadRow } from "@/components/admin/downloads/product-download-list";

const PAGE_SIZE = 20;

function variantLabel(v: {
  size: string | null;
  variantType: string | null;
  orifice: string | null;
  minOperatingTemp: string | null;
  maxOperatingTemp: string | null;
  flowFactor: string | null;
  power: string | null;
}) {
  return [v.size, v.variantType, v.orifice, v.minOperatingTemp, v.maxOperatingTemp, v.flowFactor, v.power].filter(Boolean).join(" / ");
}

export default async function AdminDownloadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; categoryId?: string }>;
}) {
  const { page: pageParam, q, categoryId } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [products, variants, downloadCategories, standaloneDownloads] = await Promise.all([
    prisma.product.findMany({
      where: { productType: "simple" },
      select: { id: true, name: true, image: true, downloads: true },
    }),
    prisma.productVariant.findMany({
      select: {
        id: true,
        downloads: true,
        size: true,
        variantType: true,
        orifice: true,
        minOperatingTemp: true,
        maxOperatingTemp: true,
        flowFactor: true,
        power: true,
        product: { select: { id: true, name: true, image: true } },
      },
    }),
    prisma.downloadCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.download.findMany({
      select: { id: true, title: true, fileUrl: true, tab: true, categoryId: true },
    }),
  ]);

  const categoryNameById = new Map(downloadCategories.map((c) => [c.id, c.name]));

  const fromProducts: AdminDownloadRow[] = products.flatMap((p) =>
    (p.downloads ?? [])
      .filter((d) => d.url)
      .map((d, i) => ({
        id: `product-${p.id}-${i}`,
        title: d.title,
        categoryId: d.categoryId ?? "",
        categoryName: categoryNameById.get(d.categoryId) ?? "Uncategorized",
        fileUrl: d.url,
        image: p.image,
        productName: p.name,
        variantLabel: null,
        kind: "product" as const,
        editHref: `/admin/products/${p.id}`,
      }))
  );

  const fromVariants: AdminDownloadRow[] = variants.flatMap((v) =>
    (v.downloads ?? [])
      .filter((d) => d.url)
      .map((d, i) => ({
        id: `variant-${v.id}-${i}`,
        title: d.title,
        categoryId: d.categoryId ?? "",
        categoryName: categoryNameById.get(d.categoryId) ?? "Uncategorized",
        fileUrl: d.url,
        image: v.product.image,
        productName: v.product.name,
        variantLabel: variantLabel(v) || null,
        kind: "product" as const,
        editHref: `/admin/products/${v.product.id}/variants/${v.id}`,
      }))
  );

  const fromStandalone: AdminDownloadRow[] = standaloneDownloads.map((d) => ({
    id: `standalone-${d.id}`,
    title: d.title,
    categoryId: d.categoryId ?? "",
    categoryName: categoryNameById.get(d.categoryId ?? "") ?? "Uncategorized",
    fileUrl: d.fileUrl,
    image: null,
    productName: "—",
    variantLabel: null,
    kind: "standalone" as const,
    tab: d.tab,
    downloadId: d.id,
  }));

  // Product/variant rows are derived by flat-mapping the `downloads` JSON
  // column off every simple Product and every ProductVariant; standalone
  // rows come from the `Download` table. Filtering/pagination below is over
  // this in-memory merged array, not a single Prisma `where`+`skip`/`take`.
  const allItems = [...fromProducts, ...fromVariants, ...fromStandalone];

  const tabCounts: Record<string, number> = {};
  for (const item of allItems) tabCounts[item.categoryId] = (tabCounts[item.categoryId] ?? 0) + 1;

  const categoryFiltered = categoryId ? allItems.filter((i) => i.categoryId === categoryId) : allItems;
  const lowerQ = q?.toLowerCase();
  const filtered = lowerQ
    ? categoryFiltered.filter(
        (i) => i.title.toLowerCase().includes(lowerQ) || i.productName.toLowerCase().includes(lowerQ)
      )
    : categoryFiltered;

  const total = filtered.length;
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Downloads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Downloads attached to a product/variant, shown on the public Downloads page.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Downloads" }]} />
      </div>

      <ProductDownloadList
        items={items}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        q={q ?? ""}
        categoryId={categoryId ?? "all"}
        categories={downloadCategories}
        tabCounts={tabCounts}
        totalAll={allItems.length}
      />
    </div>
  );
}
