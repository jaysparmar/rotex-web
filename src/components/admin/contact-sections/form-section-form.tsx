"use client";

import Image from "next/image";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, FieldGrid } from "@/components/admin/form-fields";
import { Switch } from "@/components/ui/switch";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveContactSection } from "@/app/admin/(dashboard)/contact/actions";

type Partner = { id: string; name: string; logo: string };
type ContactFormData = {
  eyebrow: string;
  heading: string;
  description: string;
  certificationsLabel: string;
  certificationsText: string;
  trustLabel: string;
  partnerIds: string[];
  enquiryTypeOptions: string[];
  productTypeOptions: string[];
  countryOptions: string[];
  cityOptions: string[];
  defaultCountry: string;
};
type FormValues = {
  enabled: boolean;
  eyebrow: string;
  heading: string;
  description: string;
  certificationsLabel: string;
  certificationsText: string;
  trustLabel: string;
  partnerIds: string[];
  enquiryTypeOptions: string;
  productTypeOptions: string;
  countryOptions: string;
  cityOptions: string;
  defaultCountry: string;
};

export function ContactFormSectionForm({
  initialEnabled,
  initialData,
  allPartners,
}: {
  initialEnabled: boolean;
  initialData: ContactFormData;
  allPartners: Partner[];
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      eyebrow: initialData.eyebrow,
      heading: initialData.heading,
      description: initialData.description,
      certificationsLabel: initialData.certificationsLabel,
      certificationsText: initialData.certificationsText,
      trustLabel: initialData.trustLabel,
      partnerIds: initialData.partnerIds ?? [],
      enquiryTypeOptions: (initialData.enquiryTypeOptions ?? []).join(", "),
      productTypeOptions: (initialData.productTypeOptions ?? []).join(", "),
      countryOptions: (initialData.countryOptions ?? []).join(", "),
      cityOptions: (initialData.cityOptions ?? []).join(", "),
      defaultCountry: initialData.defaultCountry,
    },
  });
  const { pending, error, success, run } = useSaveAction();
  const selectedPartners = form.watch("partnerIds");

  function togglePartner(id: string, checked: boolean) {
    const current = form.getValues("partnerIds");
    form.setValue("partnerIds", checked ? [...current, id] : current.filter((p) => p !== id));
  }

  function splitList(value: string) {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  function onSubmit(values: FormValues) {
    const { enabled, enquiryTypeOptions, productTypeOptions, countryOptions, cityOptions, ...rest } = values;
    const data: ContactFormData = {
      ...rest,
      enquiryTypeOptions: splitList(enquiryTypeOptions),
      productTypeOptions: splitList(productTypeOptions),
      countryOptions: splitList(countryOptions),
      cityOptions: splitList(cityOptions),
    };
    run(async () => {
      try {
        await saveContactSection("form", { enabled, data });
        toast.success("Contact Form section saved");
      } catch (err) {
        toast.error("Failed to save Contact Form section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />

        <TextField label="Eyebrow" {...form.register("eyebrow")} />
        <TextField label="Heading" {...form.register("heading")} />
        <TextAreaField label="Description" {...form.register("description")} />
        <FieldGrid>
          <TextField label="Certifications Label" {...form.register("certificationsLabel")} />
          <TextField label="Trust Label" {...form.register("trustLabel")} />
        </FieldGrid>
        <TextField label="Certifications Text" {...form.register("certificationsText")} />

        <div className="space-y-1 rounded-lg border border-border">
          <span className="block p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Trusted Partner Logos
          </span>
          {allPartners.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No published partners yet. Add some on the Partners page first.
            </p>
          )}
          {allPartners.map((partner) => (
            <div key={partner.id} className="flex items-center gap-4 border-t border-border p-4">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
                {partner.logo && (
                  <Image src={partner.logo} alt={partner.name} width={40} height={40} className="size-full object-contain" unoptimized />
                )}
              </div>
              <span className="flex-1 text-sm font-medium">{partner.name}</span>
              <Switch
                checked={selectedPartners.includes(partner.id)}
                onCheckedChange={(v) => togglePartner(partner.id, v)}
              />
            </div>
          ))}
        </div>

        <div className="space-y-4 rounded-lg border border-border p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Form Dropdown Options</span>
          <TextField label="Enquiry Types (comma separated)" {...form.register("enquiryTypeOptions")} />
          <TextField label="Product Types (comma separated)" {...form.register("productTypeOptions")} />
          <FieldGrid>
            <TextField label="Countries (comma separated)" {...form.register("countryOptions")} />
            <TextField label="Cities (comma separated)" {...form.register("cityOptions")} />
          </FieldGrid>
          <TextField label="Default Country" {...form.register("defaultCountry")} />
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
