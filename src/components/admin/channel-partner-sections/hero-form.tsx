"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, FieldGrid } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveChannelPartnerSection } from "@/app/admin/(dashboard)/channel-partner/actions";

type HeroData = {
  title: string;
  description: string;
  image: string;
  cta: { label: string; href: string };
};
type FormValues = {
  enabled: boolean;
  title: string;
  description: string;
  image: { src: string };
  cta: { label: string; href: string };
};

export function ChannelPartnerHeroForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: HeroData;
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      title: initialData.title,
      description: initialData.description,
      image: { src: initialData.image ?? "" },
      cta: initialData.cta,
    },
  });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, image, ...rest } = values;
    const data: HeroData = { ...rest, image: image.src };
    run(async () => {
      try {
        await saveChannelPartnerSection("hero", { enabled, data });
        toast.success("Hero section saved");
      } catch (err) {
        toast.error("Failed to save hero section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Title" {...form.register("title")} />
        <TextAreaField label="Description" {...form.register("description")} />
        <FieldGrid>
          <TextField label="CTA Label" {...form.register("cta.label")} />
          <TextField label="CTA Href" {...form.register("cta.href")} />
        </FieldGrid>
        <MediaField name="image" mediaType="image" showAlt={false} />
        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
