"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SaveBar } from "@/components/admin/section-form-shell";
import { IndustryTreePicker, type IndustryTreeOption } from "@/components/admin/resources/industry-tree-picker";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveFormFields } from "@/app/admin/(dashboard)/forms/actions";
import { FORM_FIELDS, PRODUCT_TYPE_OPTIONS, ENQUIRY_TYPE_OPTIONS_BY_FORM, type FormKey } from "@/lib/form-config-shared";

export function FormFieldsEditor({
  formKey,
  initial,
  initialIndustryIds,
  industries,
}: {
  formKey: FormKey;
  initial: Record<string, boolean>;
  initialIndustryIds: string[];
  industries: IndustryTreeOption[];
}) {
  const [fields, setFields] = useState(initial);
  const [industryIds, setIndustryIds] = useState(initialIndustryIds);
  const { pending, error, success, run } = useSaveAction();
  const enquiryTypeOptions = ENQUIRY_TYPE_OPTIONS_BY_FORM[formKey];

  function onSave() {
    run(async () => {
      await saveFormFields(formKey, fields, industryIds);
      toast.success("Form fields saved");
    });
  }

  return (
    <form
      className="max-w-xl space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <div className="divide-y divide-border rounded-lg border border-border">
        {FORM_FIELDS.map((f) => (
          <div key={f.key} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{f.label}</span>
              {f.locked && <Lock className="size-3 text-muted-foreground" />}
            </div>
            <Switch
              checked={f.locked ? true : (fields[f.key] ?? true)}
              disabled={f.locked}
              onCheckedChange={(v) => setFields((prev) => ({ ...prev, [f.key]: v }))}
            />
          </div>
        ))}
      </div>

      {fields.industry && (
        <div className="space-y-2 rounded-lg border border-border p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Allowed Industries for &quot;Industry Served&quot;
          </span>
          <p className="text-xs text-muted-foreground">
            Only the industries (and sub-industries) checked here show in this form&apos;s dropdown. Nothing checked
            means no options show yet.
          </p>
          <IndustryTreePicker industries={industries} selectedIds={industryIds} onChange={setIndustryIds} />
        </div>
      )}

      {fields.enquiryType && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Enquiry Type options (fixed)
          </p>
          {enquiryTypeOptions ? (
            <p className="mt-1.5 text-sm text-muted-foreground">{enquiryTypeOptions.join(", ")}</p>
          ) : (
            <p className="mt-1.5 text-sm text-muted-foreground">
              No option set defined for this form yet — the field won&apos;t render on the live page until one is.
            </p>
          )}
        </div>
      )}

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Product Type options (fixed)
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">{PRODUCT_TYPE_OPTIONS.join(", ")}</p>
      </div>

      <SaveBar pending={pending} error={error} success={success} />
    </form>
  );
}
