"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTheme } from "next-themes";
import { Editor } from "@tinymce/tinymce-react";
import { marked } from "marked";
import "@/components/admin/resources/tinymce-theme.css";
import { Field } from "@/components/admin/form-fields";

function looksLikeHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

export function RichTextField({ name, label }: { name: string; label: string }) {
  const form = useFormContext();
  const raw = form.getValues(name) as string;
  const initialValue = raw && !looksLikeHtml(raw) ? (marked.parse(raw, { async: false }) as string) : raw;
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Field label={label}>
        <div className="h-160 rounded-md border bg-muted animate-pulse" />
      </Field>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Field label={label}>
      <Editor
        id={`${name}-editor`}
        key={isDark ? "dark" : "light"}
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        initialValue={initialValue}
        onEditorChange={(value) => form.setValue(name, value, { shouldDirty: true })}
        init={{
          height: 640,
          menubar: true,
          promotion: false,
          toolbar_mode: "wrap",
          skin: isDark ? "oxide-dark" : "oxide",
          content_css: isDark ? "dark" : "default",
          content_style: isDark
            ? "body { background-color: #2a2525; color: #ffffff; font-family: inherit; }"
            : "body { background-color: #ffffff; color: #201d1d; font-family: inherit; }",
          plugins: [
            "advlist", "autolink", "lists", "link", "image", "charmap", "preview", "anchor",
            "searchreplace", "visualblocks", "visualchars", "fullscreen", "insertdatetime",
            "media", "table", "code", "help", "wordcount", "emoticons", "nonbreaking",
            "pagebreak", "directionality", "quickbars",
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


