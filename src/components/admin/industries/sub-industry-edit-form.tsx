"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { TextField, TextAreaField, FieldGrid, RepeaterItem, AddButton, Field } from "@/components/admin/form-fields";
import { Input } from "@/components/ui/input";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SaveBar } from "@/components/admin/section-form-shell";
import { ItemPickerGrid } from "@/components/admin/item-picker-grid";
import { StoryPickerList } from "@/components/admin/story-picker-list";
import { useSaveAction } from "@/hooks/use-save-action";
import { createSubIndustry, updateSubIndustry } from "@/app/admin/(dashboard)/industries/actions";

type Partner = { id: string; name: string; logo: string };
type Story = { id: string; quote: string; author: string; company: string; image: string };
type CategoryOption = { id: string; name: string; image: string | null };
type CardItem = { title: string; description: string };

type FormValues = {
  name: string;
  slug: string;
  description: string;
  image: string;
  mobileImage: string;
  importReference: string;
  partnerIds: string[];
  storyIds: string[];
  challengesTitle: string;
  challenges: CardItem[];
  solutionsTitle: string;
  solutions: CardItem[];
  recommendedProducts: string[];
};

type SubIndustryInput = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  mobileImage: string | null;
  importReference: string | null;
  partnerIds: unknown;
  storyIds: unknown;
  challengesTitle: string;
  solutionsTitle: string;
  challenges: unknown;
  solutions: unknown;
  recommendedProducts: unknown;
};

export function SubIndustryEditForm({
  industryId,
  industryName,
  subIndustry,
  allPartners,
  allStories,
  categories,
}: {
  industryId: string;
  industryName: string;
  subIndustry?: SubIndustryInput;
  allPartners: Partner[];
  allStories: Story[];
  categories: CategoryOption[];
}) {
  const router = useRouter();

  const form = useForm<FormValues>({
    defaultValues: {
      name: subIndustry?.name ?? "",
      slug: subIndustry?.slug ?? "",
      description: subIndustry?.description ?? "",
      image: subIndustry?.image ?? "",
      mobileImage: subIndustry?.mobileImage ?? "",
      importReference: subIndustry?.importReference ?? "",
      partnerIds: (subIndustry?.partnerIds as string[] | null) ?? [],
      storyIds: (subIndustry?.storyIds as string[] | null) ?? [],
      challengesTitle: subIndustry?.challengesTitle ?? "",
      challenges: (subIndustry?.challenges as CardItem[] | null) ?? [],
      solutionsTitle: subIndustry?.solutionsTitle ?? "",
      solutions: (subIndustry?.solutions as CardItem[] | null) ?? [],
      recommendedProducts: (subIndustry?.recommendedProducts as string[] | null) ?? [],
    },
  });
  const { pending, error, success, run } = useSaveAction();

  const selectedPartnerIds = form.watch("partnerIds");
  const selectedStoryIds = form.watch("storyIds");
  const selectedProductCategoryIds = form.watch("recommendedProducts");
  const challengesArray = useFieldArray({ control: form.control, name: "challenges" });
  const solutionsArray = useFieldArray({ control: form.control, name: "solutions" });

  function togglePartner(id: string, checked: boolean) {
    const current = form.getValues("partnerIds");
    form.setValue("partnerIds", checked ? [...current, id] : current.filter((p) => p !== id));
  }

  function toggleStory(id: string, checked: boolean) {
    const current = form.getValues("storyIds");
    form.setValue("storyIds", checked ? [...current, id] : current.filter((s) => s !== id));
  }

  function toggleProductCategory(id: string, checked: boolean) {
    const current = form.getValues("recommendedProducts");
    form.setValue("recommendedProducts", checked ? [...current, id] : current.filter((c) => c !== id));
  }

  function onSubmit(values: FormValues) {
    const data = {
      name: values.name,
      slug: values.slug,
      description: values.description,
      image: values.image,
      mobileImage: values.mobileImage,
      importReference: values.importReference.trim() || null,
      partnerIds: values.partnerIds,
      storyIds: values.storyIds,
      challengesTitle: values.challengesTitle,
      solutionsTitle: values.solutionsTitle,
      challenges: values.challenges,
      solutions: values.solutions,
      recommendedProducts: values.recommendedProducts,
    };

    run(async () => {
      if (subIndustry) {
        await updateSubIndustry(subIndustry.id, data);
      } else {
        const created = await createSubIndustry(industryId, data);
        router.push(`/admin/industries/${industryId}/sub-industries/${created.id}`);
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
            <CardDescription>Name, slug, image, and the intro shown on the sub-industry banner.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGrid>
              <TextField label="Name" {...form.register("name")} />
              <TextField label="Slug" {...form.register("slug")} />
            </FieldGrid>
            <TextAreaField label="Description" {...form.register("description")} />
            <ImageUrlField name="image" label="Banner Image" />
            <ImageUrlField name="mobileImage" label="Banner Image (Mobile)" />
            <Field label="Import Reference">
              <Input {...form.register("importReference")} className="h-9" />
              <p className="text-xs text-muted-foreground">
                Optional code used to match this sub-industry to a spreadsheet column during bulk product import.
              </p>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trusted by Industry Leaders</CardTitle>
            <CardDescription>Pick which partner logos appear on this sub-industry page.</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemPickerGrid
              items={allPartners.map((p) => ({ id: p.id, image: p.logo, label: p.name }))}
              selectedIds={selectedPartnerIds}
              onToggle={togglePartner}
              emptyMessage="No published partners yet. Add some on the Partners page first."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application</CardTitle>
            <CardDescription>Cards shown in the left column of the applications v/s why choose Rotex section.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Application Title" {...form.register("challengesTitle")} />
            <div className="space-y-3">
              {challengesArray.fields.map((field, i) => (
                <RepeaterItem key={field.id} title={`Card ${i + 1}`} onRemove={() => challengesArray.remove(i)}>
                  <TextField label="Title" {...form.register(`challenges.${i}.title`)} />
                  <TextAreaField label="Description" {...form.register(`challenges.${i}.description`)} />
                </RepeaterItem>
              ))}
              <AddButton
                label="Add Card"
                onClick={() => challengesArray.append({ title: "", description: "" })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Why Choose Rotex for {industryName} Industries</CardTitle>
            <CardDescription>Cards shown in the right column of the challenges vs. solutions section.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Solutions Title" {...form.register("solutionsTitle")} />
            <div className="space-y-3">
              {solutionsArray.fields.map((field, i) => (
                <RepeaterItem key={field.id} title={`Card ${i + 1}`} onRemove={() => solutionsArray.remove(i)}>
                  <TextField label="Title" {...form.register(`solutions.${i}.title`)} />
                  <TextAreaField label="Description" {...form.register(`solutions.${i}.description`)} />
                </RepeaterItem>
              ))}
              <AddButton
                label="Add Card"
                onClick={() => solutionsArray.append({ title: "", description: "" })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Products</CardTitle>
            <CardDescription>
              Pick which product categories show in the &quot;Products recommended for you&quot; swiper on this
              sub-industry page. Sourced live from Categories — edit a category&apos;s image/name at Admin →
              Categories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ItemPickerGrid
              items={categories.map((c) => ({ id: c.id, image: c.image ?? "", label: c.name }))}
              selectedIds={selectedProductCategoryIds}
              onToggle={toggleProductCategory}
              emptyMessage="No categories with products yet."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Stories</CardTitle>
            <CardDescription>
              Pick which stories appear on this sub-industry page. Manage the stories themselves from the
              Customer Stories page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StoryPickerList
              stories={allStories}
              selectedIds={selectedStoryIds}
              onToggle={toggleStory}
              emptyMessage="No published customer stories yet. Add some on the Customer Stories page first."
            />
          </CardContent>
        </Card>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
