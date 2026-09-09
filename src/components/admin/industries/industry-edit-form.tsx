"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { TextField, TextAreaField, FieldGrid, RepeaterItem, AddButton, Field } from "@/components/admin/form-fields";
import { Input } from "@/components/ui/input";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SaveBar } from "@/components/admin/section-form-shell";
import { useSaveAction } from "@/hooks/use-save-action";
import { createIndustry, updateIndustry } from "@/app/admin/(dashboard)/industries/actions";

type Stat = { value: string; suffix?: string; label: string };
type WhyChooseCard = { title: string; description: string };

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
};

export function IndustryEditForm({ industry }: { industry?: IndustryInput }) {
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
    },
  });
  const { pending, error, success, run } = useSaveAction();

  const statsArray = useFieldArray({ control: form.control, name: "stats" });
  const cardsArray = useFieldArray({ control: form.control, name: "whyChoose.cards" });

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

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
