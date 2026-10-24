import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { ResourceEditForm } from "@/components/admin/resources/resource-edit-form";
import { getIndustryTreeOptions, getProductCategoryOptions } from "@/lib/resource-tags";

export default async function AdminResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [record, products, industries, relatedOptions, allMedia] = await Promise.all([
    prisma.resource.findUnique({ where: { id } }),
    getProductCategoryOptions(),
    getIndustryTreeOptions(),
    prisma.resource.findMany({
      where: { published: true, id: { not: id } },
      orderBy: { createdAt: "desc" },
      select: { id: true, type: true, title: true, image: true },
    }),
    prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, url: true, type: true, filename: true, alt: true },
    }),
  ]);
  if (!record) notFound();

  const resource = {
    ...record,
    gallery: (record.gallery as string[]) ?? [],
    productIds: (record.productIds as string[]) ?? [],
    industryIds: (record.industryIds as string[]) ?? [],
    extraTags: (record.extraTags as string[]) ?? [],
    relatedIds: (record.relatedIds as string[]) ?? [],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{resource.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">/{resource.slug}</p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Resources", href: "/admin/resources" },
            { label: resource.title },
          ]}
        />
      </div>

      <ResourceEditForm
        resource={resource}
        products={products.map((p) => ({ id: p.id, label: p.name }))}
        industries={industries}
        relatedOptions={relatedOptions}
        allMedia={allMedia.map((a) => ({ ...a, type: a.type as "image" | "video" }))}
      />
    </div>
  );
}
