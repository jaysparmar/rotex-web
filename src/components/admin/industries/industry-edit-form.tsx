"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { TextField, TextAreaField, FieldGrid, RepeaterItem, AddButton, Field } from "@/components/admin/form-fields";
import { Input } from "@/components/ui/input";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SaveBar } from "@/components/admin/section-form-shell";
import { Switch } from "@/components/ui/switch";
import { ItemPickerGrid } from "@/components/admin/item-picker-grid";
import { StoryPickerList } from "@/components/admin/story-picker-list";
import { useSaveAction } from "@/hooks/use-save-action";
import { createIndustry, updateIndustry } from "@/app/admin/(dashboard)/industries/actions";

type Stat = { value: string; suffix?: string; label: string };
type WhyChooseCard = { title: string; description: string };
type CardItem = { title: string; description: string };
type Partner = { id: string; name: string; logo: string };
type Story = { id: string; quote: string; author: string; company: string; image: string };
type CategoryOption = { id: string; name: string; image: string | null };

type FormValues = {
  name: string;
  slug: string;
  bgKey: string;
  image: string;
  mobileImage: string;
  description: string;
  sectionTitle: string;
  overview: string;
  importReference: string;
  stats: Stat[];
  whyChoose: { title: string; highlight: string; cards: WhyChooseCard[] };
  useSubIndustries: boolean;
  partnerIds: string[];
  storyIds: string[];
  challengesTitle: string;
  challenges: CardItem[];
  solutionsTitle: string;
  solutions: CardItem[];
  recommendedProducts: string[];
};

type IndustryInput = {
  id: string;
  name: string;
  slug: string;
  bgKey: string | null;
  image: string | null;
  mobileImage: string | null;
  description: string;
  sectionTitle: string;
  overview: string;
  importReference: string | null;
  stats: unknown;
  whyChoose: unknown;
  useSubIndustries: boolean;
  partnerIds: unknown;
  storyIds: unknown;
  challengesTitle: string;
  solutionsTitle: string;
  challenges: unknown;
  solutions: unknown;
  recommendedProducts: unknown;
};

export function IndustryEditForm({
  industry,
  allPartners,
  allStories,
  categories,
}: {
  industry?: IndustryInput;
  allPartners: Partner[];
  allStories: Story[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const stats = (industry?.stats as Stat[] | null) ?? [];
  const whyChoose = (industry?.whyChoose as FormValues["whyChoose"] | null) ?? {
    title: "",
    highlight: "",
    cards: [],
  };

  const form = useForm<FormValues>({
    defaultValues: {
      name: industry?.name ?? "",
      slug: industry?.slug ?? "",
      bgKey: industry?.bgKey ?? "",
      image: industry?.image ?? "",
      mobileImage: industry?.mobileImage ?? "",
      description: industry?.description ?? "",
      sectionTitle: industry?.sectionTitle ?? "",
      overview: industry?.overview ?? "",
      importReference: industry?.importReference ?? "",
      stats,
      whyChoose,
      useSubIndustries: industry?.useSubIndustries ?? true,
      partnerIds: (industry?.partnerIds as string[] | null) ?? [],
      storyIds: (industry?.storyIds as string[] | null) ?? [],
      challengesTitle: industry?.challengesTitle ?? "",
      challenges: (industry?.challenges as CardItem[] | null) ?? [],
      solutionsTitle: industry?.solutionsTitle ?? "",
      solutions: (industry?.solutions as CardItem[] | null) ?? [],
      recommendedProducts: (industry?.recommendedProducts as string[] | null) ?? [],
    },
  });
  const { pending, error, success, run } = useSaveAction();

  const statsArray = useFieldArray({ control: form.control, name: "stats" });
  const cardsArray = useFieldArray({ control: form.control, name: "whyChoose.cards" });
  const challengesArray = useFieldArray({ control: form.control, name: "challenges" });
  const solutionsArray = useFieldArray({ control: form.control, name: "solutions" });

  const useSubIndustries = form.watch("useSubIndustries");
  const nameValue = form.watch("name");
  const selectedPartnerIds = form.watch("partnerIds");
  const selectedStoryIds = form.watch("storyIds");
  const selectedProductCategoryIds = form.watch("recommendedProducts");

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
    const data = { ...values, importReference: values.importReference.trim() || null };
    run(async () => {
      if (industry) {
        await updateIndustry(industry.id, data);
      } else {
        const created = await createIndustry(data);
        router.push(`/admin/industries/${created.id}`);
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
            <CardDescription>Name, slug, and background used across the industry&apos;s pages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGrid>
              <TextField label="Name" {...form.register("name")} />
              <TextField label="Slug" {...form.register("slug")} />
            </FieldGrid>
            <FieldGrid>
              <TextField label="Background Key" {...form.register("bgKey")} />
              <ImageUrlField name="image" label="Home Teaser Image" />
            </FieldGrid>
            <ImageUrlField name="mobileImage" label="Home Teaser Image (Mobile)" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Home Teaser</CardTitle>
            <CardDescription>Shown on the home page&apos;s industry card.</CardDescription>
          </CardHeader>
          <CardContent>
            <TextAreaField label="Description" {...form.register("description")} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>The main heading and body copy on the industry&apos;s detail page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Section Title" {...form.register("sectionTitle")} />
            <TextAreaField label="Overview" rows={6} {...form.register("overview")} />
            <Field label="Import Reference">
              <Input {...form.register("importReference")} className="h-9" />
              <p className="text-xs text-muted-foreground">
                Optional code used to match this industry to a spreadsheet column during bulk product import.
              </p>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
            <CardDescription>The numbers shown alongside the overview.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex justify-end">
              <AddButton
                label="Add Stat"
                onClick={() => statsArray.append({ value: "", suffix: "", label: "" })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {statsArray.fields.map((field, i) => (
                <RepeaterItem key={field.id} title={`Stat ${i + 1}`} onRemove={() => statsArray.remove(i)}>
                  <FieldGrid>
                    <TextField label="Value" {...form.register(`stats.${i}.value`)} />
                    <TextField label="Suffix" {...form.register(`stats.${i}.suffix`)} />
                  </FieldGrid>
                  <TextField label="Label" {...form.register(`stats.${i}.label`)} />
                </RepeaterItem>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Why Choose Rotex</CardTitle>
            <CardDescription>The accordion cards shown near the bottom of the detail page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGrid>
              <TextField label="Title" {...form.register("whyChoose.title")} />
              <TextField label="Highlight" {...form.register("whyChoose.highlight")} />
            </FieldGrid>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cards</span>
              <AddButton
                label="Add Card"
                onClick={() => cardsArray.append({ title: "", description: "" })}
              />
            </div>
            <div className="space-y-3">
              {cardsArray.fields.map((field, i) => (
                <RepeaterItem key={field.id} title={`Card ${i + 1}`} onRemove={() => cardsArray.remove(i)}>
                  <TextField label="Title" {...form.register(`whyChoose.cards.${i}.title`)} />
                  <TextAreaField label="Description" {...form.register(`whyChoose.cards.${i}.description`)} />
                </RepeaterItem>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Use Sub-Industries</CardTitle>
            <CardDescription>
              When on, this industry is managed through its Sub-Industries below. When off, add the content
              directly here instead — it&apos;s shown straight on the industry page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium">Use Sub-Industries</p>
                <p className="text-xs text-muted-foreground">
                  Turn off if this industry has no sub-industries and should show its own content directly.
                </p>
              </div>
              <Switch
                checked={useSubIndustries}
                onCheckedChange={(v) => form.setValue("useSubIndustries", v)}
              />
            </div>
          </CardContent>
        </Card>

        {!useSubIndustries && (
          <>
            <div className="rounded-lg border border-dashed border-border p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Direct Content — shown on the industry page since Use Sub-Industries is off
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Trusted by Industry Leaders</CardTitle>
                <CardDescription>Pick which partner logos appear on this industry page.</CardDescription>
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
                <CardTitle>Why Choose Rotex for {nameValue || industry?.name || "this"} Industries</CardTitle>
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
                  Pick which product categories show in the &quot;Products recommended for you&quot; swiper on
                  this industry page. Sourced live from Categories — edit a category&apos;s image/name at Admin →
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
                  Pick which stories appear on this industry page. Manage the stories themselves from the
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
          </>
        )}

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
