"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TextField, FieldGrid, SwitchField } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { createCountry, updateCountry } from "@/app/admin/(dashboard)/countries/actions";

type CountryFormValues = {
  name: string;
  stateOrCity: string;
  partnerCompany: string;
  lat: number;
  lng: number;
  published: boolean;
};

export function CountryFormDialog({
  country,
  trigger,
}: {
  country?: {
    id: string;
    name: string;
    stateOrCity: string | null;
    partnerCompany: string | null;
    lat: number;
    lng: number;
    published: boolean;
  };
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<CountryFormValues>({
    defaultValues: {
      name: country?.name ?? "",
      stateOrCity: country?.stateOrCity ?? "",
      partnerCompany: country?.partnerCompany ?? "",
      lat: country?.lat ?? 0,
      lng: country?.lng ?? 0,
      published: country?.published ?? true,
    },
  });
  const { pending, error, run } = useSaveAction();

  function onSubmit(values: CountryFormValues) {
    run(async () => {
      try {
        if (country) {
          await updateCountry(country.id, values);
        } else {
          await createCountry(values);
        }
      } catch (err) {
        toast.error(country ? "Failed to update country" : "Failed to add country");
        throw err;
      }
      toast.success(country ? "Country updated" : "Country added");
      setOpen(false);
      form.reset();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{country ? "Edit Country" : "Add Country"}</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TextField label="Country Name" {...form.register("name", { required: true })} />
            <FieldGrid>
              <TextField label="State / City (optional)" {...form.register("stateOrCity")} />
              <TextField label="Partner Company (optional)" {...form.register("partnerCompany")} />
            </FieldGrid>
            <FieldGrid>
              <TextField
                label="Latitude"
                type="number"
                step="any"
                {...form.register("lat", { required: true, valueAsNumber: true })}
              />
              <TextField
                label="Longitude"
                type="number"
                step="any"
                {...form.register("lng", { required: true, valueAsNumber: true })}
              />
            </FieldGrid>
            <SwitchField
              label="Published"
              checked={form.watch("published")}
              onCheckedChange={(v) => form.setValue("published", v)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
