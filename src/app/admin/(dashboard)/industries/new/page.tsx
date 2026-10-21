import { prisma } from "@/lib/prisma";
import { getPublishedPartners } from "@/lib/partners";
import { getPublishedCustomerStories } from "@/lib/customer-stories";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { IndustryEditForm } from "@/components/admin/industries/industry-edit-form";

export default async function AdminNewIndustryPage() {
  const [allPartners, allStories, categories] = await Promise.all([
    getPublishedPartners(),
    getPublishedCustomerStories(),
    prisma.category.findMany({
      where: { products: { some: {} } },
      orderBy: { order: "asc" },
      select: { id: true, name: true, image: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">New Industry</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a new industry sector shown on the home page and its dedicated pages.
          </p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Industries", href: "/admin/industries" },
            { label: "New" },
          ]}
        />
      </div>

      <IndustryEditForm allPartners={allPartners} allStories={allStories} categories={categories} />
    </div>
  );
}
