"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { Field, TextField, TextAreaField, FieldGrid } from "@/components/admin/form-fields";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SaveBar } from "@/components/admin/section-form-shell";
import { ItemPickerGrid } from "@/components/admin/item-picker-grid";
import { StoryPickerList } from "@/components/admin/story-picker-list";
import { useSaveAction } from "@/hooks/use-save-action";
import { createSubIndustry, updateSubIndustry } from "@/app/admin/(dashboard)/industries/actions";

type Partner = { id: string; name: string; logo: string };
type Story = { id: string; quote: string; author: string; company: string; image: string };

type FormValues = {
  name: string;
  slug: string;
  description: string;
  image: string;
  partnerIds: string[];
  storyIds: string[];
  challengesTitle: string;
  challenges: string;
  solutionsTitle: string;
  solutionsIntro: string;
  solutions: string;
  // recommendedProducts: string; // TODO: re-enable once wired to the real Product catalog
};

type SubIndustryInput = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  partnerIds: unknown;
  storyIds: unknown;
  challengesTitle: string;
  solutionsTitle: string;
  solutionsIntro: string;
  challenges: unknown;
  solutions: unknown;
  // recommendedProducts: unknown; // TODO: re-enable once wired to the real Product catalog
};

function toLines(value: unknown): string {
  return ((value as string[] | null) ?? []).join("\n");
}

function fromLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function SubIndustryEditForm({
  industryId,
  subIndustry,
  allPartners,
  allStories,
}: {
  industryId: string;
  subIndustry?: SubIndustryInput;
  allPartners: Partner[];
  allStories: Story[];
}) {
  const router = useRouter();

  const form = useForm<FormValues>({
    defaultValues: {
      name: subIndustry?.name ?? "",
      slug: subIndustry?.slug ?? "",
      description: subIndustry?.description ?? "",
      image: subIndustry?.image ?? "",
      partnerIds: (subIndustry?.partnerIds as string[] | null) ?? [],
      storyIds: (subIndustry?.storyIds as string[] | null) ?? [],
      challengesTitle: subIndustry?.challengesTitle ?? "",
      challenges: toLines(subIndustry?.challenges),
      solutionsTitle: subIndustry?.solutionsTitle ?? "",
      solutionsIntro: subIndustry?.solutionsIntro ?? "",
      solutions: toLines(subIndustry?.solutions),
      // recommendedProducts: toLines(subIndustry?.recommendedProducts), // TODO: re-enable once wired to the real Product catalog
    },
  });
  const { pending, error, success, run } = useSaveAction();

  const selectedPartnerIds = form.watch("partnerIds");
  const selectedStoryIds = form.watch("storyIds");

  function togglePartner(id: string, checked: boolean) {
    const current = form.getValues("partnerIds");
    form.setValue("partnerIds", checked ? [...current, id] : current.filter((p) => p !== id));
  }

  function toggleStory(id: string, checked: boolean) {
    const current = form.getValues("storyIds");
    form.setValue("storyIds", checked ? [...current, id] : current.filter((s) => s !== id));
  }

  function onSubmit(values: FormValues) {
    const data = {
      name: values.name,
      slug: values.slug,
      description: values.description,
      image: values.image,
      partnerIds: values.partnerIds,
      storyIds: values.storyIds,
      challengesTitle: values.challengesTitle,
      solutionsTitle: values.solutionsTitle,
      solutionsIntro: values.solutionsIntro,
      challenges: fromLines(values.challenges),
      solutions: fromLines(values.solutions),
      // recommendedProducts: fromLines(values.recommendedProducts), // TODO: re-enable once wired to the real Product catalog
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
            <CardTitle>Challenges</CardTitle>
            <CardDescription>Shown in the left column of the challenges vs. solutions section.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Challenges Title" {...form.register("challengesTitle")} />
            <Controller
              control={form.control}
              name="challenges"
              render={({ field }) => (
                <Field label="Challenges (one per line)">
                  <Textarea {...field} rows={5} />
                </Field>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Solutions</CardTitle>
            <CardDescription>Shown in the right column of the challenges vs. solutions section.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Solutions Title" {...form.register("solutionsTitle")} />
            <TextAreaField label="Solutions Intro" {...form.register("solutionsIntro")} />
            <Controller
              control={form.control}
              name="solutions"
              render={({ field }) => (
                <Field label="Solutions (one per line)">
                  <Textarea {...field} rows={5} />
                </Field>
              )}
            />
          </CardContent>
        </Card>

        {/* TODO: re-enable once recommended products are wired to the real Product catalog
        <Card>
          <CardHeader>
            <CardTitle>Recommended Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              control={form.control}
              name="recommendedProducts"
              render={({ field }) => (
                <Field label="Recommended Products (one per line)">
                  <Textarea {...field} rows={4} />
                </Field>
              )}
            />
          </CardContent>
        </Card>
        */}

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
