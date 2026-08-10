"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveSupplierSection } from "@/app/admin/(dashboard)/supplier/actions";

type FormSectionData = {
  headingPrefix: string;
  headingHighlight: string;
  description: string;
  countryOptions: string[];
  cityOptions: string[];
  businessTypeOptions: string[];
  industryOptions: string[];
  defaultCountry: string;
};
type FormValues = {
  enabled: boolean;
  headingPrefix: string;
  headingHighlight: string;
  description: string;
  countryOptions: string;
  cityOptions: string;
  businessTypeOptions: string;
  industryOptions: string;
  defaultCountry: string;
};

export function SupplierFormSectionForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: FormSectionData;
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      headingPrefix: initialData.headingPrefix,
      headingHighlight: initialData.headingHighlight,
      description: initialData.description,
      countryOptions: (initialData.countryOptions ?? []).join(", "),
      cityOptions: (initialData.cityOptions ?? []).join(", "),
      businessTypeOptions: (initialData.businessTypeOptions ?? []).join(", "),
      industryOptions: (initialData.industryOptions ?? []).join(", "),
      defaultCountry: initialData.defaultCountry,
    },
  });
  const { pending, error, success, run } = useSaveAction();

  function splitList(value: string) {
    return value.split(",").map((v) => v.trim()).filter(Boolean);
  }

  function onSubmit(values: FormValues) {
    const { enabled, countryOptions, cityOptions, businessTypeOptions, industryOptions, ...rest } = values;
    const data: FormSectionData = {
      ...rest,
      countryOptions: splitList(countryOptions),
      cityOptions: splitList(cityOptions),
      businessTypeOptions: splitList(businessTypeOptions),
      industryOptions: splitList(industryOptions),
    };
    run(async () => {
      try {
        await saveSupplierSection("form", { enabled, data });
        toast.success("Application Form section saved");
      } catch (err) {
        toast.error("Failed to save Application Form section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading Prefix" {...form.register("headingPrefix")} />
        <TextField label="Heading Highlight" {...form.register("headingHighlight")} />
        <TextAreaField label="Description" {...form.register("description")} />

        <div className="space-y-4 rounded-lg border border-border p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Form Dropdown Options</span>
          <TextField label="Countries (comma separated)" {...form.register("countryOptions")} />
          <TextField label="Cities (comma separated)" {...form.register("cityOptions")} />
          <TextField label="Business Types (comma separated)" {...form.register("businessTypeOptions")} />
          <TextField label="Industries Served (comma separated)" {...form.register("industryOptions")} />
          <TextField label="Default Country" {...form.register("defaultCountry")} />
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
