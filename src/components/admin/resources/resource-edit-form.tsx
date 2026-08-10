"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TextField, FieldGrid, SwitchField, SelectField, Field } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { SaveBar } from "@/components/admin/section-form-shell";
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

export function ResourceEditForm({ resource, defaultType }: { resource?: Resource; defaultType?: string }) {
  const router = useRouter();
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
  const { pending, error, success, run } = useSaveAction();

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
          const created = await createResource(payload);
          router.push(`/admin/resources/${created.id}`);
        }
        toast.success(resource ? "Resource updated" : "Resource added");
      } catch (err) {
        toast.error(resource ? "Failed to update resource" : "Failed to add resource");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
            <CardDescription>Type, title, slug, and cover image.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SelectField
              label="Type"
              options={RESOURCE_TYPES.map((t) => ({ value: t.id, label: t.label }))}
              defaultValue={resource?.type ?? defaultType ?? RESOURCE_TYPES[0].id}
              {...form.register("type", { required: true })}
            />
            <TextField label="Title" {...form.register("title", { required: true })} onChange={handleTitleChange} />
            <TextField label="Slug" {...form.register("slug", { required: true })} onChange={handleSlugChange} />
            <MediaField name="image" mediaType="image" showAlt={false} previewFit="contain" />
            <FieldGrid>
              <TextField label="Product tag" {...form.register("product")} />
              <TextField label="Industry tag" {...form.register("industry")} />
            </FieldGrid>
            <TextField label="Extra tags (comma separated)" {...form.register("extraTags")} />
            <SwitchField
              label="Published"
              checked={form.watch("published")}
              onCheckedChange={(v) => form.setValue("published", v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
            <CardDescription>Markdown — supports ## headings, **bold**, links, lists, images.</CardDescription>
          </CardHeader>
          <CardContent>
            <ContentField />
          </CardContent>
        </Card>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}

function ContentField() {
  const form = useFormContext<ResourceFormValues>();
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const { ref: registerRef, ...contentProps } = form.register("content");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!json.success) return;

      const snippet = `![${file.name}](${json.data.url})`;
      const textarea = textareaRef.current;
      const current = form.getValues("content");

      if (textarea) {
        const start = textarea.selectionStart ?? current.length;
        const end = textarea.selectionEnd ?? current.length;
        const next = `${current.slice(0, start)}${snippet}${current.slice(end)}`;
        form.setValue("content", next, { shouldDirty: true });
        requestAnimationFrame(() => {
          textarea.focus();
          textarea.selectionStart = textarea.selectionEnd = start + snippet.length;
        });
      } else {
        form.setValue("content", current ? `${current}\n\n${snippet}\n` : snippet, { shouldDirty: true });
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <Field label="Content">
      <div className="space-y-2">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="gap-1.5"
          >
            {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
            {uploading ? "Uploading..." : "Insert Image"}
          </Button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
        <Textarea
          {...contentProps}
          ref={(el) => {
            registerRef(el);
            textareaRef.current = el;
          }}
          rows={16}
        />
      </div>
    </Field>
  );
}
