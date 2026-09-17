import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { EnquiriesTabs } from "@/components/admin/enquiries/enquiries-tabs";
import { buildEnquiryWhere, SUPPLIER_TAB, OTHER_TAB, NO_PRODUCT_PLACEHOLDER } from "@/lib/enquiry-filters";

const PAGE_SIZE = 20;

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; product?: string; page?: string }>;
}) {
  const { tab: tabParam, product, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const industries = await prisma.industry.findMany({ select: { id: true, name: true }, orderBy: { createdAt: "asc" } });
  const industryNames = industries.map((i) => i.name);

  const [supplierCount, industryGroups, otherCount] = await Promise.all([
    prisma.enquiry.count({ where: { source: "supplier" } }),
    prisma.enquiry.groupBy({ by: ["industryName"], where: { source: { not: "supplier" } }, _count: true }),
    prisma.enquiry.count({ where: { source: { not: "supplier" }, industryName: { notIn: industryNames } } }),
  ]);

  const countByIndustry = Object.fromEntries(industryGroups.map((g) => [g.industryName, g._count]));

  // Supplier applications get their own tab — they were never "about" an
  // industry, the form just repurposes the same table/columns. "Other" is
  // anything that isn't Supplier and doesn't match a known industry name.
  const tabs = [...industryNames, ...(supplierCount > 0 ? [SUPPLIER_TAB] : []), ...(otherCount > 0 ? [OTHER_TAB] : [])];

  const tabCounts: Record<string, number> = {
    ...Object.fromEntries(industryNames.map((n) => [n, countByIndustry[n] ?? 0])),
    [SUPPLIER_TAB]: supplierCount,
    [OTHER_TAB]: otherCount,
  };

  const active = tabParam && tabs.includes(tabParam) ? tabParam : (tabs[0] ?? "");
  const where = buildEnquiryWhere(active, industryNames, product);

  const [enquiries, total, productRows] = await Promise.all([
    prisma.enquiry.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.enquiry.count({ where }),
    prisma.enquiry.findMany({
      where: buildEnquiryWhere(active, industryNames),
      distinct: ["product"],
      select: { product: true },
    }),
  ]);

  const productNames = Array.from(
    new Set(productRows.map((p) => p.product).filter((p) => p && p !== NO_PRODUCT_PLACEHOLDER))
  ).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Enquiries</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Submissions from the industry enquiry forms, the Contact page, and Supplier applications.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Enquiries" }]} />
      </div>

      <EnquiriesTabs
        tabs={tabs}
        tabCounts={tabCounts}
        active={active}
        enquiries={enquiries}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        product={product ?? ""}
        productNames={productNames}
      />
    </div>
  );
}
