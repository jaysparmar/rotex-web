"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { TextField, FieldGrid } from "@/components/admin/form-fields";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SaveBar } from "@/components/admin/section-form-shell";
import { useSaveAction } from "@/hooks/use-save-action";
import { createCompany, updateCompany } from "@/app/admin/(dashboard)/companies/actions";

type FormValues = {
  name: string;
  slug: string;
};

type CompanyInput = {
  id: string;
  name: string;
  slug: string;
};

export function CompanyEditForm({ company }: { company?: CompanyInput }) {
  const router = useRouter();

  const form = useForm<FormValues>({
    defaultValues: {
      name: company?.name ?? "",
      slug: company?.slug ?? "",
    },
  });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    run(async () => {
      if (company) {
        await updateCompany(company.id, values);
      } else {
        const created = await createCompany(values);
        router.push(`/admin/companies/${created.id}`);
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
            <CardDescription>Name and slug used to identify this company across the admin.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGrid>
              <TextField label="Name" {...form.register("name")} />
              <TextField label="Slug" {...form.register("slug")} />
            </FieldGrid>
          </CardContent>
        </Card>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
