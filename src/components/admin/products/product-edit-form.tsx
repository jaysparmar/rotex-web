"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { TextField, SelectField, FieldGrid } from "@/components/admin/form-fields";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { ProductContentFields, type ProductContentFormValues } from "@/components/admin/products/product-content-fields";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SaveBar } from "@/components/admin/section-form-shell";
import { useSaveAction } from "@/hooks/use-save-action";
import { createProduct, updateProduct, type ProductInput } from "@/app/admin/(dashboard)/products/actions";
import { PRODUCT_FAMILIES, PRODUCT_TYPES } from "@/lib/product-constants";

const NONE = "__none__";

type CompanyOption = {
  id: string;
  name: string;
  categories: { id: string; name: string; subCategories: { id: string; name: string }[] }[];
};
type IndustryOption = { id: string; name: string; subIndustries: { id: string; name: string }[] };

type ProductFormValues = ProductContentFormValues & {
  modelNumber: string;
  name: string;
  image: string;
  productFamily: string;
  productType: string;
  companyId: string;
  categoryId: string;
  subCategoryId: string;
  industryId: string;
  subIndustryId: string;
  industriesServed: string;
};

type ProductRecord = {
  id: string;
  modelNumber: string;
  name: string;
  image: string | null;
  productFamily: string;
  productType: string;
  companyId: string;
  categoryId: string;
  subCategoryId: string | null;
  industryId: string | null;
  subIndustryId: string | null;
  industriesServed: string | null;
  certificates: unknown;
  features: string | null;
  description: string | null;
  specifications: unknown;
  downloads: unknown;
};

export function ProductEditForm({
  product,
  companies,
  industries,
  downloadCategories,
}: {
  product?: ProductRecord;
  companies: CompanyOption[];
  industries: IndustryOption[];
  downloadCategories: { id: string; name: string }[];
}) {
  const router = useRouter();

  const form = useForm<ProductFormValues>({
    defaultValues: {
      modelNumber: product?.modelNumber ?? "",
      name: product?.name ?? "",
      image: product?.image ?? "",
      productFamily: product?.productFamily ?? PRODUCT_FAMILIES[0],
      productType: product?.productType ?? "simple",
      companyId: product?.companyId ?? companies[0]?.id ?? "",
      categoryId: product?.categoryId ?? "",
      subCategoryId: product?.subCategoryId ?? NONE,
      industryId: product?.industryId ?? NONE,
      subIndustryId: product?.subIndustryId ?? NONE,
      industriesServed: product?.industriesServed ?? "",
      certificates: (product?.certificates as string[] | null) ?? [],
      features: product?.features ?? "",
      description: product?.description ?? "",
      specifications: (product?.specifications as { key: string; value: string }[] | null) ?? [],
      downloads: (
        (product?.downloads as
          | {
              title: string;
              description: string;
              url: string;
              categoryId: string;
              tab?: string;
            }[]
          | null) ?? []
      ).map((d) => ({
        title: d.title,
        description: d.description,
        url: { src: d.url },
        categoryId: d.categoryId ?? "",
        tab: d.tab ?? "certificates",
      })) as never,
    },
  });
  const { pending, error, success, run } = useSaveAction();

  const companyId = form.watch("companyId");
  const categoryId = form.watch("categoryId");
  const industryId = form.watch("industryId");
  const productType = form.watch("productType");

  const selectedCompany = companies.find((c) => c.id === companyId);
  const categoryOptions = (selectedCompany?.categories ?? []).map((c) => ({ value: c.id, label: c.name }));
  const selectedCategory = selectedCompany?.categories.find((c) => c.id === categoryId);
  const subCategoryOptions = [
    { value: NONE, label: "— None —" },
    ...(selectedCategory?.subCategories ?? []).map((s) => ({ value: s.id, label: s.name })),
  ];

  const selectedIndustry = industries.find((i) => i.id === industryId);
  const subIndustryOptions = [
    { value: NONE, label: "— None —" },
    ...(selectedIndustry?.subIndustries ?? []).map((s) => ({ value: s.id, label: s.name })),
  ];

  function onSubmit(values: ProductFormValues) {
    if (!values.categoryId) {
      toast.error("Please select a Category before saving.");
      return;
    }

    const data: ProductInput = {
      modelNumber: values.modelNumber,
      name: values.name,
      image: values.image || null,
      productFamily: values.productFamily,
      productType: values.productType,
      companyId: values.companyId,
      categoryId: values.categoryId,
      subCategoryId: values.subCategoryId === NONE ? null : values.subCategoryId,
      industryId: values.industryId === NONE ? null : values.industryId,
      subIndustryId: values.subIndustryId === NONE ? null : values.subIndustryId,
      industriesServed: values.industriesServed || null,
      certificates: values.certificates,
      features: values.features || null,
      description: values.description || null,
      specifications: values.specifications.filter((s) => s.key.trim()),
      downloads: values.downloads.filter((d) => d.title.trim()).map((d) => ({ ...d, url: d.url.src })),
    };

    run(async () => {
      try {
        if (product) {
          await updateProduct(product.id, data);
        } else {
          const created = await createProduct(data);
          router.push(`/admin/products/${created.id}`);
        }
        toast.success(product ? "Product updated" : "Product added");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : product ? "Failed to update product" : "Failed to add product");
        throw err;
      }
    });
  }

  function onInvalid(errors: FieldErrors<ProductFormValues>) {
    if (errors.downloads) {
      toast.error("Select a category for every download before saving.");
      return;
    }
    toast.error("Please fix the highlighted fields before saving.");
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
            <CardDescription>Model number is the unique identifier this product is looked up by.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGrid>
              <TextField label="Model Number" {...form.register("modelNumber", { required: true })} />
              <TextField label="Name" {...form.register("name", { required: true })} />
            </FieldGrid>
            <ImageUrlField name="image" label="Image" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGrid>
              <SelectField
                label="Product Family"
                options={PRODUCT_FAMILIES.map((f) => ({ value: f, label: f }))}
                defaultValue={form.getValues("productFamily")}
                {...form.register("productFamily")}
              />
              <SelectField
                label="Product Type"
                options={[...PRODUCT_TYPES]}
                defaultValue={form.getValues("productType")}
                {...form.register("productType")}
              />
            </FieldGrid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company & Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGrid>
              <SelectField
                label="Company"
                options={companies.map((c) => ({ value: c.id, label: c.name }))}
                value={companyId}
                onChange={(e) => {
                  form.setValue("companyId", e.target.value);
                  form.setValue("categoryId", "");
                  form.setValue("subCategoryId", NONE);
                }}
              />
              <SelectField
                label="Category"
                options={categoryOptions}
                value={categoryId}
                onChange={(e) => {
                  form.setValue("categoryId", e.target.value);
                  form.setValue("subCategoryId", NONE);
                }}
              />
            </FieldGrid>
            <SelectField
              label="Sub-Category"
              options={subCategoryOptions}
              value={form.watch("subCategoryId")}
              onChange={(e) => form.setValue("subCategoryId", e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Industry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGrid>
              <SelectField
                label="Industry"
                options={[{ value: NONE, label: "— None —" }, ...industries.map((i) => ({ value: i.id, label: i.name }))]}
                value={industryId}
                onChange={(e) => {
                  form.setValue("industryId", e.target.value);
                  form.setValue("subIndustryId", NONE);
                }}
              />
              <SelectField
                label="Sub-Industry"
                options={subIndustryOptions}
                value={form.watch("subIndustryId")}
                onChange={(e) => form.setValue("subIndustryId", e.target.value)}
              />
            </FieldGrid>
            <TextField label="Industries Served" {...form.register("industriesServed")} />
          </CardContent>
        </Card>

        {productType === "simple" && <ProductContentFields downloadCategories={downloadCategories} />}

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
