import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { HeaderConfigForm } from "@/components/admin/home-sections/header-config-form";

export default async function AdminGlobalHeaderPage() {
  const record = await prisma.globalConfig.findUniqueOrThrow({ where: { id: "global" } });
  const config = record.data as PrismaJson.GlobalConfigData;

  const industries = await prisma.industry.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      subIndustries: { select: { id: true, name: true }, orderBy: { createdAt: "asc" } },
    },
  });

  const categoryRows = await prisma.product.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });
  const productCategories = categoryRows.map((r) => r.category);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Header</h1>
          <p className="mt-1 text-sm text-muted-foreground">Logo, navigation, and mega menus.</p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Global Config", href: "/admin/global" },
            { label: "Header" },
          ]}
        />
      </div>

      <HeaderConfigForm
        initialData={{ logo: config.logo, header: config.header }}
        footer={config.footer}
        industries={industries}
        productCategories={productCategories}
      />
    </div>
  );
}
