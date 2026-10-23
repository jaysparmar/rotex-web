import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { FormFieldsEditor } from "@/components/admin/forms/form-fields-editor";
import { getFormConfig, getIndustryTree, FORMS, type FormKey } from "@/lib/form-config";

export default async function AdminFormEditPage({ params }: { params: Promise<{ formKey: string }> }) {
  const { formKey } = await params;
  const form = FORMS.find((f) => f.key === formKey);
  if (!form) notFound();

  const [config, industries] = await Promise.all([getFormConfig(), getIndustryTree()]);
  const entry = config[form.key];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{form.label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{form.path}</p>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Form Fields", href: "/admin/forms" },
            { label: form.label },
          ]}
        />
      </div>

      <FormFieldsEditor
        formKey={form.key as FormKey}
        initial={entry?.fields ?? {}}
        initialIndustryIds={entry?.industryIds ?? []}
        industries={industries}
      />
    </div>
  );
}
