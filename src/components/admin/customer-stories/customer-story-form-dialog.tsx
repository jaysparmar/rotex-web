"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TextField, TextAreaField, SwitchField } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { useSaveAction } from "@/hooks/use-save-action";
import { createCustomerStory, updateCustomerStory } from "@/app/admin/(dashboard)/customer-stories/actions";

type StoryFormValues = {
  quote: string;
  author: string;
  company: string;
  published: boolean;
  mediaType: "image" | "video";
  image: { src: string };
};

type Story = {
  id: string;
  quote: string;
  author: string;
  company: string;
  image: string;
  mediaType: string;
  published: boolean;
};

export function CustomerStoryFormDialog({
  story,
  trigger,
}: {
  story?: Story;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<StoryFormValues>({
    defaultValues: {
      quote: story?.quote ?? "",
      author: story?.author ?? "",
      company: story?.company ?? "",
      published: story?.published ?? true,
      mediaType: (story?.mediaType as "image" | "video") ?? "image",
      image: { src: story?.image ?? "" },
    },
  });
  const { pending, error, run } = useSaveAction();
  const mediaType = form.watch("mediaType");

  function onSubmit(values: StoryFormValues) {
    const payload = {
      quote: values.quote,
      author: values.author,
      company: values.company,
      published: values.published,
      mediaType: values.mediaType,
      image: values.image.src,
    };
    run(async () => {
      try {
        if (story) {
          await updateCustomerStory(story.id, payload);
        } else {
          await createCustomerStory(payload);
        }
      } catch (err) {
        toast.error(story ? "Failed to update story" : "Failed to add story");
        throw err;
      }
      toast.success(story ? "Story updated" : "Story added");
      setOpen(false);
      form.reset();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{story ? "Edit Customer Story" : "Add Customer Story"}</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TextAreaField label="Quote" {...form.register("quote", { required: true })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Author" {...form.register("author", { required: true })} />
              <TextField label="Company" {...form.register("company", { required: true })} />
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1 w-fit">
              <button
                type="button"
                onClick={() => {
                  form.setValue("mediaType", "image");
                  form.setValue("image.src", "");
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  mediaType === "image" ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
              >
                Image
              </button>
              <button
                type="button"
                onClick={() => {
                  form.setValue("mediaType", "video");
                  form.setValue("image.src", "");
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  mediaType === "video" ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
              >
                Video
              </button>
            </div>
            <MediaField name="image" mediaType={mediaType} showAlt={false} defaultMode="upload" />
            <SwitchField
              label="Published"
              checked={form.watch("published")}
              onCheckedChange={(v) => form.setValue("published", v)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
