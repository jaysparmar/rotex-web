"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField } from "@/components/admin/form-fields";
import { Switch } from "@/components/ui/switch";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveChannelPartnerSection } from "@/app/admin/(dashboard)/channel-partner/actions";

type Country = { id: string; name: string; stateOrCity: string | null; partnerCompany: string | null };
type FormValues = {
  enabled: boolean;
  heading: string;
  description: string;
  callout: string;
  countryIds: string[];
};

export function ChannelPartnerMapForm({
  initialEnabled,
  initialData,
  allCountries,
}: {
  initialEnabled: boolean;
  initialData: { heading: string; description: string; callout: string; countryIds: string[] };
  allCountries: Country[];
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      heading: initialData.heading,
      description: initialData.description,
      callout: initialData.callout,
      countryIds: initialData.countryIds ?? [],
    },
  });
  const { pending, error, success, run } = useSaveAction();
  const selectedCountries = form.watch("countryIds");

  function toggleCountry(id: string, checked: boolean) {
    const current = form.getValues("countryIds");
    form.setValue("countryIds", checked ? [...current, id] : current.filter((c) => c !== id));
  }

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveChannelPartnerSection("map", { enabled, data });
        toast.success("Global Partner Map saved");
      } catch (err) {
        toast.error("Failed to save Global Partner Map");
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
        <TextField label="Callout" {...form.register("callout")} />

        <div className="space-y-1 rounded-lg border border-border">
          <span className="block p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Locations Shown on Map
          </span>
          {allCountries.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No published countries yet. Add some on the Countries page first.
            </p>
          )}
          {allCountries.map((country) => (
            <div key={country.id} className="flex items-center gap-4 border-t border-border p-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{country.name}</p>
                <p className="text-xs text-muted-foreground">
                  {[country.stateOrCity, country.partnerCompany].filter(Boolean).join(" — ") || "—"}
                </p>
              </div>
              <Switch
                checked={selectedCountries.includes(country.id)}
                onCheckedChange={(v) => toggleCountry(country.id, v)}
              />
            </div>
          ))}
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
