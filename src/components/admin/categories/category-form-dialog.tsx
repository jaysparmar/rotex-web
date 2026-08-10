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
import { TextField, SelectField, SwitchField, FieldGrid } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { useSaveAction } from "@/hooks/use-save-action";
import { slugify } from "@/lib/product-import";
import {
  createCategory,
  updateCategory,
} from "@/app/admin/(dashboard)/categories/actions";

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  image: string | null;
  order: number;
  published: boolean;
  parentId: string | null;
};

type CategoryFormValues = {
  name: string;
  slug: string;
  tagline: string;
  parentId: string;
  order: number;
  published: boolean;
  image: { src: string };
};

export function CategoryFormDialog({
  category,
  parentOptions,
  trigger,
}: {
  category?: CategoryRow;
  parentOptions: { id: string; name: string }[];
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const slugTouched = useRef(Boolean(category));
  const form = useForm<CategoryFormValues>({
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      tagline: category?.tagline ?? "",
      parentId: category?.parentId ?? "none",
      order: category?.order ?? 0,
      published: category?.published ?? true,
      image: { src: category?.image ?? "" },
    },
  });
  const { pending, error, run } = useSaveAction();

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    form.setValue("name", e.target.value);
    if (!slugTouched.current) {
      form.setValue("slug", slugify(e.target.value));
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    slugTouched.current = true;
    form.setValue("slug", e.target.value);
  }

  function onSubmit(values: CategoryFormValues) {
    const payload = {
      name: values.name,
      slug: values.slug.trim() || slugify(values.name),
      tagline: values.tagline,
      parentId: values.parentId === "none" ? null : values.parentId,
      order: Number(values.order),
      published: values.published,
      image: values.image.src,
    };
    run(async () => {
      try {
        if (category) {
          await updateCategory(category.id, payload);
        } else {
          await createCategory(payload);
        }
      } catch (err) {
        toast.error(category ? "Failed to update category" : "Failed to add category");
        throw err;
      }
      toast.success(category ? "Category updated" : "Category added");
      setOpen(false);
      slugTouched.current = Boolean(category);
      form.reset();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TextField
              label="Name"
              {...form.register("name", { required: true })}
              onChange={handleNameChange}
            />
            <TextField
              label="Slug"
              {...form.register("slug", { required: true })}
              onChange={handleSlugChange}
            />
            <TextField label="Tagline" {...form.register("tagline", { required: true })} />
            <MediaField name="image" mediaType="image" showAlt={false} />
            <FieldGrid>
              <SelectField
                label="Parent Category"
                placeholder="None (top-level)"
                options={[
                  { value: "none", label: "None (top-level)" },
                  ...parentOptions.map((p) => ({ value: p.id, label: p.name })),
                ]}
                {...form.register("parentId")}
              />
              <TextField
                label="Order"
                type="number"
                {...form.register("order", { required: true, valueAsNumber: true })}
              />
            </FieldGrid>
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
