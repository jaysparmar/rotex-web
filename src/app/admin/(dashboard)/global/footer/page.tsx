import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { FooterConfigForm } from "@/components/admin/home-sections/footer-config-form";

export default async function AdminGlobalFooterPage() {
  const record = await prisma.globalConfig.findUniqueOrThrow({ where: { id: "global" } });
  const config = record.data as PrismaJson.GlobalConfigData;

  const industries = await prisma.industry.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });

  const categories = await prisma.category.findMany({
    where: { products: { some: {} } },
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Footer</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tagline, link columns, social links, legal, and contact info.
          </p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Global Config", href: "/admin/global" },
            { label: "Footer" },
          ]}
        />
      </div>

      <FooterConfigForm
        initialData={{ footer: config.footer }}
        logo={config.logo}
        header={config.header}
        industries={industries}
        categories={categories}
      />
    </div>
  );
}
