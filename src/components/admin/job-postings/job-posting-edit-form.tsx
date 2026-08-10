"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider, useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TextField, TextAreaField, FieldGrid, SelectField, SwitchField, Field } from "@/components/admin/form-fields";
import { SaveBar } from "@/components/admin/section-form-shell";
import { PERK_ICON_OPTIONS } from "@/lib/job-perk-icons";
import { useSaveAction } from "@/hooks/use-save-action";
import { createJobPosting, updateJobPosting } from "@/app/admin/(dashboard)/job-postings/actions";

const EMPLOYMENT_TYPE_OPTIONS = ["Full-time", "Part-time", "Contract", "Internship"].map((v) => ({ value: v, label: v }));
const WORK_MODE_OPTIONS = ["On-site", "Hybrid", "Remote"].map((v) => ({ value: v, label: v }));
const PERK_ICON_SELECT_OPTIONS = PERK_ICON_OPTIONS.map((o) => ({ value: o.key, label: o.label }));

type JobPostingFormValues = {
  company: string;
  title: string;
  category: string;
  location: string;
  tag: string;
  employmentType: string;
  workMode: string;
  aboutRole: string;
  whatYouDo: { value: string }[];
  whatWeLookFor: { value: string }[];
  whatYouGet: { icon: string; label: string }[];
  published: boolean;
};

type JobPosting = {
  id: string;
  company: string;
  title: string;
  category: string;
  location: string;
  tag: string;
  employmentType: string;
  workMode: string;
  aboutRole: string;
  whatYouDo: unknown;
  whatWeLookFor: unknown;
  whatYouGet: unknown;
  published: boolean;
};

export function JobPostingEditForm({ job }: { job?: JobPosting }) {
  const router = useRouter();
  const form = useForm<JobPostingFormValues>({
    defaultValues: {
      company: job?.company ?? "Rotex Automation Limited",
      title: job?.title ?? "",
      category: job?.category ?? "",
      location: job?.location ?? "",
      tag: job?.tag ?? "",
      employmentType: job?.employmentType ?? "Full-time",
      workMode: job?.workMode ?? "On-site",
      aboutRole: job?.aboutRole ?? "",
      whatYouDo: ((job?.whatYouDo as string[] | null) ?? []).map((value) => ({ value })),
      whatWeLookFor: ((job?.whatWeLookFor as string[] | null) ?? []).map((value) => ({ value })),
      whatYouGet: (job?.whatYouGet as { icon: string; label: string }[] | null) ?? [],
      published: job?.published ?? true,
    },
  });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: JobPostingFormValues) {
    const payload = {
      ...values,
      whatYouDo: values.whatYouDo.map((r) => r.value).filter(Boolean),
      whatWeLookFor: values.whatWeLookFor.map((r) => r.value).filter(Boolean),
    };
    run(async () => {
      try {
        if (job) {
          await updateJobPosting(job.id, payload);
        } else {
          const created = await createJobPosting(payload);
          router.push(`/admin/job-postings/${created.id}`);
        }
        toast.success(job ? "Job posting updated" : "Job posting added");
      } catch (err) {
        toast.error(job ? "Failed to update job posting" : "Failed to add job posting");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
            <CardDescription>Title, company, and how it's tagged in listings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Job Title" {...form.register("title", { required: true })} />
            <TextField label="Company" {...form.register("company", { required: true })} />
            <FieldGrid>
              <TextField label="Category" {...form.register("category", { required: true })} />
              <TextField label="Location" {...form.register("location", { required: true })} />
            </FieldGrid>
            <FieldGrid>
              <SelectField
                label="Employment Type"
                options={EMPLOYMENT_TYPE_OPTIONS}
                defaultValue={form.getValues("employmentType")}
                {...form.register("employmentType")}
              />
              <SelectField
                label="Work Mode"
                options={WORK_MODE_OPTIONS}
                defaultValue={form.getValues("workMode")}
                {...form.register("workMode")}
              />
            </FieldGrid>
            <TextField label="Tag (e.g. Solenoid Valves)" {...form.register("tag")} />
            <SwitchField
              label="Published"
              checked={form.watch("published")}
              onCheckedChange={(v) => form.setValue("published", v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Shown in the full job detail view on the site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextAreaField label="About the Role" rows={3} {...form.register("aboutRole")} />
            <StringListField name="whatYouDo" label="What You'll Do" addLabel="Add responsibility" />
            <StringListField name="whatWeLookFor" label="What We're Looking For" addLabel="Add requirement" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What You Get</CardTitle>
            <CardDescription>Perk icons shown on the job detail view.</CardDescription>
          </CardHeader>
          <CardContent>
            <PerksField />
          </CardContent>
        </Card>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}

function StringListField({ name, label, addLabel }: { name: "whatYouDo" | "whatWeLookFor"; label: string; addLabel: string }) {
  const form = useFormContext<JobPostingFormValues>();
  const array = useFieldArray({ control: form.control, name });

  return (
    <Field label={label}>
      <div className="space-y-2">
        {array.fields.map((field, i) => (
          <div key={field.id} className="flex items-center gap-2">
            <Input {...form.register(`${name}.${i}.value`)} className="h-9" />
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => array.remove(i)}>
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => array.append({ value: "" })}>
          <Plus className="size-3.5" />
          {addLabel}
        </Button>
      </div>
    </Field>
  );
}

function PerksField() {
  const form = useFormContext<JobPostingFormValues>();
  const array = useFieldArray({ control: form.control, name: "whatYouGet" });

  return (
    <div className="space-y-2">
      {array.fields.map((field, i) => (
        <div key={field.id} className="flex items-center gap-2">
          <div className="w-52 shrink-0">
            <SelectField
              label="Icon"
              options={PERK_ICON_SELECT_OPTIONS}
              defaultValue={field.icon}
              {...form.register(`whatYouGet.${i}.icon`)}
            />
          </div>
          <Input
            {...form.register(`whatYouGet.${i}.label`)}
            placeholder="e.g. Competitive Pay"
            className="h-9 flex-1"
          />
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => array.remove(i)}>
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => array.append({ icon: PERK_ICON_OPTIONS[0].key, label: "" })}
      >
        <Plus className="size-3.5" />
        Add Perk
      </Button>
    </div>
  );
}
