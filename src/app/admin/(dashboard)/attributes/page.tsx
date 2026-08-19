import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { AttributeValuesManager } from "@/components/admin/attributes/attribute-values-manager";
import { PRODUCT_ATTRIBUTES } from "@/lib/product-constants";

export default async function AdminAttributesPage() {
  const values = await prisma.attributeValue.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const grouped = PRODUCT_ATTRIBUTES.map((attr) => ({
    ...attr,
    values: values.filter((v) => v.attribute === attr.key),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Attributes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the selectable values for each fixed variant attribute (Size, Variant Type, Orifice, etc.).
            These populate the dropdowns when creating a product variant.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Attributes" }]} />
      </div>

      <AttributeValuesManager groups={grouped} />
    </div>
  );
}
