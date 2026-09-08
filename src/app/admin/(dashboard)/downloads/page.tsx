import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { ProductDownloadList, type ProductSourcedDownload } from "@/components/admin/downloads/product-download-list";

function variantLabel(v: {
  size: string | null;
  variantType: string | null;
  orifice: string | null;
  minOperatingTemp: string | null;
  maxOperatingTemp: string | null;
  flowFactor: string | null;
}) {
  return [v.size, v.variantType, v.orifice, v.minOperatingTemp, v.maxOperatingTemp, v.flowFactor].filter(Boolean).join(" / ");
}

export default async function AdminDownloadsPage() {
  const [products, variants, downloadCategories] = await Promise.all([
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
        product: { select: { id: true, name: true, image: true } },
      },
    }),
    prisma.downloadCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  const categoryNameById = new Map(downloadCategories.map((c) => [c.id, c.name]));

  const fromProducts: ProductSourcedDownload[] = products.flatMap((p) =>
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
        editHref: `/admin/products/${p.id}`,
      }))
  );

  const fromVariants: ProductSourcedDownload[] = variants.flatMap((v) =>
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
        editHref: `/admin/products/${v.product.id}/variants/${v.id}`,
      }))
  );

  const productSourcedItems = [...fromProducts, ...fromVariants];

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

      <ProductDownloadList items={productSourcedItems} categories={downloadCategories} />
    </div>
  );
}
