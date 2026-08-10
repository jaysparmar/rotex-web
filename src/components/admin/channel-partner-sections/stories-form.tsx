"use client";

import Image from "next/image";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField } from "@/components/admin/form-fields";
import { Switch } from "@/components/ui/switch";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveChannelPartnerSection } from "@/app/admin/(dashboard)/channel-partner/actions";

type Story = { id: string; quote: string; author: string; company: string; image: string; mediaType?: string };
type FormValues = {
  enabled: boolean;
  heading: { title: string; subtitle: string };
  storyIds: string[];
};

export function ChannelPartnerStoriesForm({
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
        <TextField label="Heading Title" {...form.register("heading.title")} />
        <TextField label="Heading Subtitle" {...form.register("heading.subtitle")} />

        <div className="space-y-1 rounded-lg border border-border">
          {allStories.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No published customer stories yet. Add some on the Customer Stories page first.
            </p>
          )}
          {allStories.map((story) => (
            <div key={story.id} className="flex items-center gap-4 border-b border-border p-4 last:border-b-0">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
                {story.image && story.mediaType === "video" ? (
                  <video src={story.image} className="size-full object-cover" muted />
                ) : story.image ? (
                  <Image
                    src={story.image}
                    alt={story.author}
                    width={40}
                    height={40}
                    className="size-full object-cover"
                    unoptimized
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{story.author}, {story.company}</p>
                <p className="truncate text-xs text-muted-foreground">{story.quote}</p>
              </div>
              <Switch
                checked={selected.includes(story.id)}
                onCheckedChange={(v) => toggle(story.id, v)}
              />
            </div>
          ))}
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
