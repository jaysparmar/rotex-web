import { Breadcrumb } from "@/components/admin/breadcrumb";
import { ResourceEditForm } from "@/components/admin/resources/resource-edit-form";
import { prisma } from "@/lib/prisma";
import { getIndustryTreeOptions, getProductCategoryOptions, getExistingExtraTags } from "@/lib/resource-tags";

export default async function AdminNewResourcePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;

  const [products, industries, existingExtraTags, relatedOptions] = await Promise.all([
    getProductCategoryOptions(),
    getIndustryTreeOptions(),
    getExistingExtraTags(),
    prisma.resource.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, type: true, title: true, image: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">New Resource</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add a case study, news update, or blog post.</p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Resources", href: "/admin/resources" },
            { label: "New Resource" },
          ]}
        />
      </div>

      <ResourceEditForm
        defaultType={type}
        products={products.map((p) => ({ id: p.id, label: p.name }))}
        industries={industries}
        existingExtraTags={existingExtraTags}
        relatedOptions={relatedOptions}
      />
    </div>
  );
}
