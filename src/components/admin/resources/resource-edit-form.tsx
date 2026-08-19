"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Editor } from "@tinymce/tinymce-react";
import { marked } from "marked";
import "./tinymce-theme.css";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TextField, FieldGrid, SwitchField, SelectField, Field } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { SaveBar } from "@/components/admin/section-form-shell";
import { useSaveAction } from "@/hooks/use-save-action";
import { slugify } from "@/lib/utils";
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
            <CardDescription>Rich text editor — headings, bold, links, lists, images.</CardDescription>
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

function looksLikeHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

function ContentField() {
  const form = useFormContext<ResourceFormValues>();
  const raw = form.getValues("content");
  const initialValue = raw && !looksLikeHtml(raw) ? (marked.parse(raw, { async: false }) as string) : raw;
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Field label="Content">
        <div className="h-160 rounded-md border bg-muted animate-pulse" />
      </Field>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Field label="Content">
      <Editor
        id="resource-content-editor"
        key={isDark ? "dark" : "light"}
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        initialValue={initialValue}
        onEditorChange={(value) => form.setValue("content", value, { shouldDirty: true })}
        init={{
          height: 640,
          menubar: true,
          promotion: false,
          toolbar_mode: "wrap",
          skin: isDark ? "oxide-dark" : "oxide",
          content_css: isDark ? "dark" : "default",
          // literal hex, not CSS vars: the edit area is a same-origin iframe with its own
          // document, so --card/--card-foreground from globals.css don't inherit into it.
          // Keep in sync with the .dark/:root --card values in src/app/globals.css.
          content_style: isDark
            ? "body { background-color: #2a2525; color: #ffffff; font-family: inherit; }"
            : "body { background-color: #ffffff; color: #201d1d; font-family: inherit; }",
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "visualchars",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "help",
            "wordcount",
            "emoticons",
            "nonbreaking",
            "pagebreak",
            "directionality",
            "quickbars",
          ],
          toolbar:
            "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | " +
            "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | " +
            "link image media table | blockquote hr removeformat | charmap emoticons insertdatetime | " +
            "anchor searchreplace visualblocks | fullscreen preview code | help",
          block_formats:
            "Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Preformatted=pre; Blockquote=blockquote",
          images_upload_handler: async (blobInfo) => {
            const formData = new FormData();
            formData.append("file", blobInfo.blob(), blobInfo.filename());
            const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
            const json = await res.json();
            if (!json.success) throw new Error(json.error?.message ?? "Upload failed");
            return json.data.url as string;
          },
        }}
      />
    </Field>
  );
}
