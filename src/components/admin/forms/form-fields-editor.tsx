"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SaveBar } from "@/components/admin/section-form-shell";
import { IndustryTreePicker, type IndustryTreeOption } from "@/components/admin/resources/industry-tree-picker";
import { SortableList } from "@/components/admin/forms/sortable-list";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveFormFields, saveProductTypeConfig } from "@/app/admin/(dashboard)/forms/actions";
import { FORM_FIELDS, ENQUIRY_TYPE_OPTIONS_BY_FORM, type FormKey } from "@/lib/form-config-shared";

type ProductTypeOption = { key: string; label: string };

export function FormFieldsEditor({
  formKey,
  initial,
  initialIndustryIds,
  initialEnquiryTypeOrder,
  initialProductTypes,
  industries,
}: {
  formKey: FormKey;
  initial: Record<string, boolean>;
  initialIndustryIds: string[];
  initialEnquiryTypeOrder: string[];
  initialProductTypes: ProductTypeOption[];
  industries: IndustryTreeOption[];
}) {
  const [fields, setFields] = useState(initial);
  const [industryIds, setIndustryIds] = useState(initialIndustryIds);
  const [enquiryTypeOrder, setEnquiryTypeOrder] = useState(initialEnquiryTypeOrder);
  const [productTypes, setProductTypes] = useState(initialProductTypes);
  const { pending, error, success, run } = useSaveAction();
  const enquiryTypeOptions = ENQUIRY_TYPE_OPTIONS_BY_FORM[formKey];

  function onSave() {
    run(async () => {
      await Promise.all([
        saveFormFields(formKey, fields, industryIds, enquiryTypeOrder),
        saveProductTypeConfig(productTypes),
      ]);
      toast.success("Form fields saved");
    });
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[22rem_1fr]">
        <div className="divide-y divide-border rounded-lg border border-border">
          {FORM_FIELDS.filter(
            (f) => (!f.contactOnly || formKey === "contact") && !(f.hideOnContact && formKey === "contact")
          ).map((f) => (
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

        <div className="space-y-6">
          {fields.industry && (
            <div className="space-y-2 rounded-lg border border-border p-4">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Allowed Industries for &quot;Industry Served&quot;
              </span>
              <p className="text-xs text-muted-foreground">
                Only the industries (and sub-industries) checked here show in this form&apos;s dropdown. Nothing
                checked means no options show yet.
              </p>
              <IndustryTreePicker industries={industries} selectedIds={industryIds} onChange={setIndustryIds} />
            </div>
          )}

          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
            {fields.enquiryType && (
              <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Enquiry Type options (fixed)
                </p>
                {enquiryTypeOptions ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Options can&apos;t be edited — drag to set the order they&apos;ll show in on this form.
                    </p>
                    <SortableList
                      items={enquiryTypeOrder}
                      getId={(label) => label}
                      onReorder={setEnquiryTypeOrder}
                      renderItem={(label) => <span className="text-sm">{label}</span>}
                    />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No option set defined for this form yet — the field won&apos;t render on the live page until one
                    is.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Product Type options (fixed)
              </p>
              <p className="text-xs text-muted-foreground">
                Values are fixed, but set the label shown on-site and drag to reorder — applies to every form.
              </p>
              <SortableList
                items={productTypes}
                getId={(o) => o.key}
                onReorder={setProductTypes}
                renderItem={(o) => (
                  <input
                    value={o.label}
                    onChange={(e) =>
                      setProductTypes((prev) =>
                        prev.map((p) => (p.key === o.key ? { ...p, label: e.target.value } : p))
                      )
                    }
                    placeholder={o.key}
                    className="h-8 flex-1 rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <SaveBar pending={pending} error={error} success={success} />
    </form>
  );
}
