"use client";

import { useForm, FormProvider, useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, FieldGrid, AddButton, RepeaterItem } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveContactSection } from "@/app/admin/(dashboard)/contact/actions";

type Office = { id: string; name: string; address: string; phone: string; email: string };
type Tab = { id: string; label: string; offices: Office[] };
type FormValues = { enabled: boolean; heading: string; description: string; tabs: Tab[] };

function newOffice(): Office {
  return { id: `office-${Date.now()}-${Math.floor(Math.random() * 1e6)}`, name: "", address: "", phone: "", email: "" };
}

function newTab(): Tab {
  return { id: `tab-${Date.now()}-${Math.floor(Math.random() * 1e6)}`, label: "", offices: [] };
}

export function ContactOfficesForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { heading: string; description: string; tabs: Tab[] };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const tabsArray = useFieldArray({ control: form.control, name: "tabs" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveContactSection("offices", { enabled, data });
        toast.success("Offices section saved");
      } catch (err) {
        toast.error("Failed to save Offices section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading" {...form.register("heading")} />
        <TextAreaField label="Description" {...form.register("description")} />

        <div className="space-y-4">
          {tabsArray.fields.map((tabField, tabIndex) => (
            <RepeaterItem
              key={tabField.id}
              title={form.watch(`tabs.${tabIndex}.label`) || `Tab ${tabIndex + 1}`}
              onRemove={() => tabsArray.remove(tabIndex)}
            >
              <TextField label="Tab Label" {...form.register(`tabs.${tabIndex}.label`)} />
              <OfficesRepeater tabIndex={tabIndex} />
            </RepeaterItem>
          ))}
          <AddButton label="Add Tab" onClick={() => tabsArray.append(newTab())} />
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}

function OfficesRepeater({ tabIndex }: { tabIndex: number }) {
  const form = useFormContext<FormValues>();
  const officesArray = useFieldArray({ control: form.control, name: `tabs.${tabIndex}.offices` });

  return (
    <div className="space-y-3 border-t border-border pt-4">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Offices</span>
      {officesArray.fields.map((officeField, officeIndex) => (
        <div key={officeField.id} className="space-y-3 rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Office {officeIndex + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => officesArray.remove(officeIndex)}
            >
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          </div>
          <TextField label="Name" {...form.register(`tabs.${tabIndex}.offices.${officeIndex}.name`)} />
          <TextAreaField label="Address" {...form.register(`tabs.${tabIndex}.offices.${officeIndex}.address`)} />
          <FieldGrid>
            <TextField label="Phone" {...form.register(`tabs.${tabIndex}.offices.${officeIndex}.phone`)} />
            <TextField label="Email" {...form.register(`tabs.${tabIndex}.offices.${officeIndex}.email`)} />
          </FieldGrid>
        </div>
      ))}
      <AddButton label="Add Office" onClick={() => officesArray.append(newOffice())} />
    </div>
  );
}
