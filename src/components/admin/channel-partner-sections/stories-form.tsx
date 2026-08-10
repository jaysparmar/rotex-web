"use client";

import { useForm, FormProvider, useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, FieldGrid, AddButton } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveChannelPartnerSection } from "@/app/admin/(dashboard)/channel-partner/actions";

type Story = { id: string; quote: string; author: string; company: string; image: string };
type StoryInput = { id: string; quote: string; author: string; company: string; image: { src: string } };
type FormValues = {
  enabled: boolean;
  heading: { title: string; subtitle: string };
  stories: StoryInput[];
};

function newStory(): StoryInput {
  return { id: `story-${Date.now()}-${Math.floor(Math.random() * 1e6)}`, quote: "", author: "", company: "", image: { src: "" } };
}

export function ChannelPartnerStoriesForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { heading: { title: string; subtitle: string }; stories: Story[] };
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      heading: initialData.heading,
      stories: initialData.stories.map((s) => ({ ...s, image: { src: s.image } })),
    },
  });
  const storiesArray = useFieldArray({ control: form.control, name: "stories" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, stories, ...rest } = values;
    const data = {
      ...rest,
      stories: stories.map((s) => ({ id: s.id, quote: s.quote, author: s.author, company: s.company, image: s.image.src })),
    };
    run(async () => {
      try {
        await saveChannelPartnerSection("stories", { enabled, data });
        toast.success("Partner Stories section saved");
      } catch (err) {
        toast.error("Failed to save Partner Stories section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <FieldGrid>
          <TextField label="Heading Title" {...form.register("heading.title")} />
          <TextField label="Heading Subtitle" {...form.register("heading.subtitle")} />
        </FieldGrid>

        <div className="space-y-4">
          {storiesArray.fields.map((field, i) => (
            <StoryItem key={field.id} index={i} onRemove={() => storiesArray.remove(i)} />
          ))}
          <AddButton label="Add Story" onClick={() => storiesArray.append(newStory())} />
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}

function StoryItem({ index, onRemove }: { index: number; onRemove: () => void }) {
  const form = useFormContext<FormValues>();

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Story {index + 1}</span>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}>
          <Trash2 className="size-3.5 text-destructive" />
        </Button>
      </div>
      <TextAreaField label="Quote" {...form.register(`stories.${index}.quote`)} />
      <FieldGrid>
        <TextField label="Author" {...form.register(`stories.${index}.author`)} />
        <TextField label="Company" {...form.register(`stories.${index}.company`)} />
      </FieldGrid>
      <MediaField name={`stories.${index}.image`} mediaType="image" showAlt={false} />
    </div>
  );
}
