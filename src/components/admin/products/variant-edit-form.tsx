"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SelectField, FieldGrid } from "@/components/admin/form-fields";
import { ProductContentFields, type ProductContentFormValues } from "@/components/admin/products/product-content-fields";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SaveBar } from "@/components/admin/section-form-shell";
import { useSaveAction } from "@/hooks/use-save-action";
import { createVariant, updateVariant, type VariantInput } from "@/app/admin/(dashboard)/products/actions";
import { PRODUCT_ATTRIBUTES } from "@/lib/product-constants";

const NONE = "__none__";

type VariantFormValues = ProductContentFormValues & {
  size: string;
  variantType: string;
  orifice: string;
  minOperatingTemp: string;
  maxOperatingTemp: string;
  flowFactor: string;
};

type VariantRecord = {
  id: string;
  size: string | null;
  variantType: string | null;
  orifice: string | null;
  minOperatingTemp: string | null;
  maxOperatingTemp: string | null;
  flowFactor: string | null;
  certificates: unknown;
  features: string | null;
  description: string | null;
  specifications: unknown;
  downloads: unknown;
};

export function VariantEditForm({
  productId,
  productName,
  variant,
  attributeValues,
}: {
  productId: string;
  productName: string;
  variant?: VariantRecord;
  attributeValues: Record<string, string[]>;
}) {
  const router = useRouter();

  const form = useForm<VariantFormValues>({
    defaultValues: {
      size: variant?.size ?? NONE,
      variantType: variant?.variantType ?? NONE,
      orifice: variant?.orifice ?? NONE,
      minOperatingTemp: variant?.minOperatingTemp ?? NONE,
      maxOperatingTemp: variant?.maxOperatingTemp ?? NONE,
      flowFactor: variant?.flowFactor ?? NONE,
      certificates: (variant?.certificates as string[] | null) ?? [],
      features: variant?.features ?? "",
      description: variant?.description ?? "",
      specifications: (variant?.specifications as { key: string; value: string }[] | null) ?? [],
      downloads: (
        (variant?.downloads as
          | { title: string; description: string; url: string; tab?: string; showOnDownloadsPage?: boolean }[]
          | null) ?? []
      ).map((d) => ({
        title: d.title,
        description: d.description,
        url: { src: d.url },
        tab: d.tab ?? "certificates",
        showOnDownloadsPage: d.showOnDownloadsPage ?? false,
      })) as never,
    },
  });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: VariantFormValues) {
    const data: VariantInput = {
      size: values.size === NONE ? null : values.size,
      variantType: values.variantType === NONE ? null : values.variantType,
      orifice: values.orifice === NONE ? null : values.orifice,
      minOperatingTemp: values.minOperatingTemp === NONE ? null : values.minOperatingTemp,
      maxOperatingTemp: values.maxOperatingTemp === NONE ? null : values.maxOperatingTemp,
      flowFactor: values.flowFactor === NONE ? null : values.flowFactor,
      certificates: values.certificates,
      features: values.features || null,
      description: values.description || null,
      specifications: values.specifications.filter((s) => s.key.trim()),
      downloads: values.downloads.filter((d) => d.title.trim()).map((d) => ({ ...d, url: d.url.src })),
    };

    run(async () => {
      try {
        if (variant) {
          await updateVariant(variant.id, data);
        } else {
          const created = await createVariant(productId, data);
          router.push(`/admin/products/${productId}/variants/${created.id}`);
        }
        toast.success(variant ? "Variant updated" : "Variant added");
      } catch (err) {
        toast.error(variant ? "Failed to update variant" : "Failed to add variant");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Variant of {productName}</CardTitle>
            <CardDescription>Pick this variant&apos;s attribute values. Values are managed at Admin → Attributes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGrid>
              {PRODUCT_ATTRIBUTES.map((attr) => (
                <SelectField
                  key={attr.key}
                  label={attr.label}
                  options={[
                    { value: NONE, label: "— None —" },
                    ...(attributeValues[attr.key] ?? []).map((v) => ({ value: v, label: v })),
                  ]}
                  value={form.watch(attr.key as keyof VariantFormValues) as string}
                  onChange={(e) => form.setValue(attr.key as keyof VariantFormValues, e.target.value as never)}
                />
              ))}
            </FieldGrid>
          </CardContent>
        </Card>

        <ProductContentFields />

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
