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
import { TextField, TextAreaField, FieldGrid, SwitchField, SelectField } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { useSaveAction } from "@/hooks/use-save-action";
import { slugify } from "@/lib/product-import";
import { createResource, updateResource } from "@/app/admin/(dashboard)/resources/actions";

export const RESOURCE_TYPES = [
  { id: "case-studies", label: "Case Studies" },
  { id: "news", label: "News & Updates" },
  { id: "blogs", label: "Blogs" },
];

type ResourceFormValues = {
  type: string;
  title: string;
  slug: string;
  published: boolean;
  image: { src: string };
  product: string;
  industry: string;
  extraTags: string;
  content: string;
};

type Resource = {
  id: string;
  type: string;
  title: string;
  slug: string;
  image: string;
  published: boolean;
  product: string;
  industry: string;
  extraTags: string[];
  content: string;
};

export function ResourceFormDialog({
  resource,
  defaultType,
  trigger,
}: {
  resource?: Resource;
  defaultType?: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const slugTouched = useRef(Boolean(resource));
  const form = useForm<ResourceFormValues>({
    defaultValues: {
      type: resource?.type ?? defaultType ?? RESOURCE_TYPES[0].id,
      title: resource?.title ?? "",
      slug: resource?.slug ?? "",
      published: resource?.published ?? true,
      image: { src: resource?.image ?? "" },
      product: resource?.product ?? "",
      industry: resource?.industry ?? "",
      extraTags: (resource?.extraTags ?? []).join(", "),
      content: resource?.content ?? "",
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

  function onSubmit(values: ResourceFormValues) {
    const payload = {
      type: values.type,
      title: values.title,
      slug: values.slug.trim() || slugify(values.title),
      published: values.published,
      image: values.image.src,
      product: values.product,
      industry: values.industry,
      extraTags: values.extraTags.split(",").map((t) => t.trim()).filter(Boolean),
      content: values.content,
    };
    run(async () => {
      try {
        if (resource) {
          await updateResource(resource.id, payload);
        } else {
          await createResource(payload);
        }
      } catch (err) {
        toast.error(resource ? "Failed to update resource" : "Failed to add resource");
        throw err;
      }
      toast.success(resource ? "Resource updated" : "Resource added");
      setOpen(false);
      slugTouched.current = Boolean(resource);
      form.reset();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{resource ? "Edit Resource" : "Add Resource"}</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <SelectField
              label="Type"
              options={RESOURCE_TYPES.map((t) => ({ value: t.id, label: t.label }))}
              defaultValue={resource?.type ?? defaultType ?? RESOURCE_TYPES[0].id}
              {...form.register("type", { required: true })}
            />
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
            <MediaField name="image" mediaType="image" showAlt={false} />
            <FieldGrid>
              <TextField label="Product tag" {...form.register("product")} />
              <TextField label="Industry tag" {...form.register("industry")} />
            </FieldGrid>
            <TextField label="Extra tags (comma separated)" {...form.register("extraTags")} />
            <TextAreaField
              label="Content (Markdown — supports ## headings, **bold**, links, lists, images)"
              rows={12}
              {...form.register("content")}
            />
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
