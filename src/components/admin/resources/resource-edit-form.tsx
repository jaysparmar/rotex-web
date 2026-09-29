"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Editor } from "@tinymce/tinymce-react";
import { marked } from "marked";
import "./tinymce-theme.css";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TextField, FieldGrid, SwitchField, SelectField, Field } from "@/components/admin/form-fields";
import { MediaField } from "@/components/admin/media-field";
import { SaveBar } from "@/components/admin/section-form-shell";
import { adminFetch } from "@/lib/admin-fetch";
import { useSaveAction } from "@/hooks/use-save-action";
import { slugify } from "@/lib/utils";
import { IndustryTreePicker, type IndustryTreeOption } from "@/components/admin/resources/industry-tree-picker";
import { MultiSelectDropdown, type MultiSelectOption } from "@/components/admin/resources/multi-select-dropdown";
import { TagsCombobox } from "@/components/admin/resources/tags-combobox";
import { ItemPickerGrid } from "@/components/admin/item-picker-grid";
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
  productIds: string[];
  industryIds: string[];
  extraTags: string[];
  relatedIds: string[];
  content: string;
};

type Resource = {
  id: string;
  type: string;
  title: string;
  slug: string;
  image: string;
  published: boolean;
  productIds: string[];
  industryIds: string[];
  extraTags: string[];
  relatedIds: string[];
  content: string;
};

type RelatedResourceOption = { id: string; type: string; title: string; image: string };

export function ResourceEditForm({
  resource,
  defaultType,
  products,
  industries,
  existingExtraTags,
  relatedOptions,
}: {
  resource?: Resource;
  defaultType?: string;
  products: MultiSelectOption[];
  industries: IndustryTreeOption[];
  existingExtraTags: string[];
  relatedOptions: RelatedResourceOption[];
}) {
  const router = useRouter();
  const slugTouched = useRef(Boolean(resource));
  const form = useForm<ResourceFormValues>({
    defaultValues: {
      type: resource?.type ?? defaultType ?? RESOURCE_TYPES[0].id,
      title: resource?.title ?? "",
      slug: resource?.slug ?? "",
      published: resource?.published ?? true,
      image: { src: resource?.image ?? "" },
      productIds: resource?.productIds ?? [],
      industryIds: resource?.industryIds ?? [],
      extraTags: resource?.extraTags ?? [],
      relatedIds: resource?.relatedIds ?? [],
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
      productIds: values.productIds,
      industryIds: values.industryIds,
      extraTags: values.extraTags,
      relatedIds: values.relatedIds,
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
              <Field label="Product tag">
                <ProductsField products={products} />
              </Field>
              <Field label="Industry tag">
                <IndustriesField industries={industries} />
              </Field>
            </FieldGrid>
            <Field label="Extra tags">
              <ExtraTagsField existingExtraTags={existingExtraTags} />
            </Field>
            <SwitchField
              label="Published"
              checked={form.watch("published")}
              onCheckedChange={(v) => form.setValue("published", v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related</CardTitle>
            <CardDescription>
              Pick which same-type resources show in the &quot;Related&quot; section on this post&apos;s detail
              page. Checked = shown on site, in the order picked. Leave empty to hide the section entirely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RelatedField relatedOptions={relatedOptions} excludeId={resource?.id} />
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

function ProductsField({ products }: { products: MultiSelectOption[] }) {
  const form = useFormContext<ResourceFormValues>();
  const selected = useWatch({ control: form.control, name: "productIds" }) ?? [];

  return (
    <MultiSelectDropdown
      options={products}
      selectedIds={selected}
      onChange={(ids) => form.setValue("productIds", ids)}
      placeholder="Select product categories"
      emptyMessage="No product categories yet."
    />
  );
}

function IndustriesField({ industries }: { industries: IndustryTreeOption[] }) {
  const form = useFormContext<ResourceFormValues>();
  const selected = useWatch({ control: form.control, name: "industryIds" }) ?? [];

  return (
    <IndustryTreePicker
      industries={industries}
      selectedIds={selected}
      onChange={(ids) => form.setValue("industryIds", ids)}
    />
  );
}

function ExtraTagsField({ existingExtraTags }: { existingExtraTags: string[] }) {
  const form = useFormContext<ResourceFormValues>();
  const selected = useWatch({ control: form.control, name: "extraTags" }) ?? [];

  return (
    <TagsCombobox
      existingTags={existingExtraTags}
      selected={selected}
      onChange={(tags) => form.setValue("extraTags", tags)}
    />
  );
}

function RelatedField({
  relatedOptions,
  excludeId,
}: {
  relatedOptions: RelatedResourceOption[];
  excludeId?: string;
}) {
  const form = useFormContext<ResourceFormValues>();
  const selected = useWatch({ control: form.control, name: "relatedIds" }) ?? [];
  const type = useWatch({ control: form.control, name: "type" });

  const options = relatedOptions.filter((r) => r.type === type && r.id !== excludeId);

  function toggle(id: string, checked: boolean) {
    const current: string[] = form.getValues("relatedIds") ?? [];
    form.setValue("relatedIds", checked ? [...current, id] : current.filter((v) => v !== id));
  }

  return (
    <ItemPickerGrid
      items={options.map((r) => ({ id: r.id, image: r.image, label: r.title }))}
      selectedIds={selected}
      onToggle={toggle}
      emptyMessage="No other published resources of this type yet."
      imageFit="cover"
    />
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
            const res = await adminFetch("/api/admin/upload", { method: "POST", body: formData });
            const json = await res.json();
            if (!json.success) throw new Error(json.error?.message ?? "Upload failed");
            return json.data.url as string;
          },
        }}
      />
    </Field>
  );
}
