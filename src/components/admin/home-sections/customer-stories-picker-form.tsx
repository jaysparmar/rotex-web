"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField } from "@/components/admin/form-fields";
import { StoryPickerList } from "@/components/admin/story-picker-list";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveHomeSection } from "@/app/admin/(dashboard)/home/actions";

type Story = { id: string; quote: string; author: string; company: string; image: string };
type FormValues = {
  enabled: boolean;
  heading: { title: string; subtitle: string };
  storyIds: string[];
};

export function CustomerStoriesPickerForm({
  initialEnabled,
  initialData,
  allStories,
}: {
  initialEnabled: boolean;
  initialData: { heading: { title: string; subtitle: string }; storyIds: string[] };
  allStories: Story[];
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      heading: initialData.heading,
      storyIds: initialData.storyIds ?? [],
    },
  });
  const { pending, error, success, run } = useSaveAction();
  const selected = form.watch("storyIds");

  function toggle(id: string, checked: boolean) {
    const current = form.getValues("storyIds");
    form.setValue(
      "storyIds",
      checked ? [...current, id] : current.filter((s) => s !== id)
    );
  }

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveHomeSection("customer-stories", { enabled, data });
        toast.success("Customer stories section saved");
      } catch (err) {
        toast.error("Failed to save customer stories section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading Title" {...form.register("heading.title")} />
        <TextField label="Heading Subtitle" {...form.register("heading.subtitle")} />

        <StoryPickerList
          stories={allStories}
          selectedIds={selected}
          onToggle={toggle}
          emptyMessage="No published customer stories yet. Add some on the Customer Stories page first."
        />

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
