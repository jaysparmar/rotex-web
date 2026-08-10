"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField } from "@/components/admin/form-fields";
import { Switch } from "@/components/ui/switch";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type Country = { id: string; name: string; lat: number; lng: number };
type FormValues = { enabled: boolean; title: string; description: string; countryIds: string[] };

export function TrustedCountriesForm({
  initialEnabled,
  initialData,
  allCountries,
}: {
  initialEnabled: boolean;
  initialData: { title: string; description: string; countryIds: string[] };
  allCountries: Country[];
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      title: initialData.title,
      description: initialData.description,
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
        await saveAboutSection("trusted-countries", { enabled, data });
        toast.success("Trusted Countries section saved");
      } catch (err) {
        toast.error("Failed to save Trusted Countries section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Title" {...form.register("title")} />
        <TextAreaField label="Description" {...form.register("description")} />

        <div className="space-y-1 rounded-lg border border-border">
          <span className="block p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Countries Shown on Globe
          </span>
          {allCountries.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No published countries yet. Add some on the Countries page first.
            </p>
          )}
          {allCountries.map((country) => (
            <div key={country.id} className="flex items-center gap-4 border-t border-border p-4">
              <span className="flex-1 text-sm font-medium">
                {country.name}
                <span className="ml-2 text-xs text-muted-foreground">
                  {country.lat}, {country.lng}
                </span>
              </span>
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
