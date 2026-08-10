"use client";

import { useRef, useState } from "react";
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
import { TextField, TextAreaField, SwitchField, FieldGrid } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { useSaveAction } from "@/hooks/use-save-action";
import { slugify } from "@/lib/product-import";
import { createAward, updateAward } from "@/app/admin/(dashboard)/awards/actions";

type AwardFormValues = {
  title: string;
  slug: string;
  year: string;
  description: string;
  url: string;
  published: boolean;
  image: { src: string };
};

type Award = {
  id: string;
  title: string;
  slug: string;
  year: string;
  description: string;
  url: string;
  image: string;
  published: boolean;
};

export function AwardFormDialog({ award, trigger }: { award?: Award; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const slugTouched = useRef(Boolean(award));
  const form = useForm<AwardFormValues>({
    defaultValues: {
      title: award?.title ?? "",
      slug: award?.slug ?? "",
      year: award?.year ?? "",
      description: award?.description ?? "",
      url: award?.url ?? "",
      published: award?.published ?? true,
      image: { src: award?.image ?? "" },
    },
  });
  const { pending, error, run } = useSaveAction();

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    form.setValue("title", e.target.value);
    if (!slugTouched.current) {
      form.setValue("slug", slugify(e.target.value));
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    slugTouched.current = true;
    form.setValue("slug", e.target.value);
  }

  function onSubmit(values: AwardFormValues) {
    const payload = {
      title: values.title,
      slug: values.slug.trim() || slugify(values.title),
      year: values.year,
      description: values.description,
      url: values.url,
      published: values.published,
      image: values.image.src,
    };
    run(async () => {
      try {
        if (award) {
          await updateAward(award.id, payload);
        } else {
          await createAward(payload);
        }
      } catch (err) {
        toast.error(award ? "Failed to update award" : "Failed to add award");
        throw err;
      }
      toast.success(award ? "Award updated" : "Award added");
      setOpen(false);
      slugTouched.current = Boolean(award);
      form.reset();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{award ? "Edit Award" : "Add Award"}</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TextField
              label="Title"
              {...form.register("title", { required: true })}
              onChange={handleTitleChange}
            />
            <TextField
              label="Slug"
              {...form.register("slug", { required: true })}
              onChange={handleSlugChange}
            />
            <FieldGrid>
              <TextField label="Year" {...form.register("year", { required: true })} />
              <TextField label="Award URL" {...form.register("url", { required: true })} />
            </FieldGrid>
            <TextAreaField label="Description" {...form.register("description", { required: true })} />
            <MediaField name="image" mediaType="image" showAlt={false} />
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
