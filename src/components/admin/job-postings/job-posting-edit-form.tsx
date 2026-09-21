"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm, FormProvider, useFieldArray, useFormContext, Controller, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TextField, TextAreaField, FieldGrid, SelectField, SwitchField, Field } from "@/components/admin/form-fields";
import { SaveBar } from "@/components/admin/section-form-shell";
import { PERK_ICON_OPTIONS } from "@/lib/job-perk-icons";
import { EMPLOYMENT_TYPE_OPTIONS, WORK_MODE_OPTIONS } from "@/lib/job-posting-constants";
import { useSaveAction } from "@/hooks/use-save-action";
import { createJobPosting, updateJobPosting } from "@/app/admin/(dashboard)/job-postings/actions";

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

export function JobPostingEditForm({
  job,
  companyOptions = [],
  tagOptions = [],
}: {
  job?: JobPosting;
  companyOptions?: string[];
  tagOptions?: string[];
}) {
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
            <SelectField
              label="Company"
              options={companyOptions.map((c) => ({ value: c, label: c }))}
              defaultValue={form.getValues("company")}
              {...form.register("company", { required: true })}
            />
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
            <SelectField
              label="Tag"
              placeholder="Select category"
              options={tagOptions.map((t) => ({ value: t, label: t }))}
              defaultValue={form.getValues("tag")}
              {...form.register("tag")}
            />
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

/** Icon dropdown for one perk row — shows a small preview of the currently
 * selected icon next to the trigger, and next to each option in the list, so
 * the admin can see exactly which glyph they're placing. Searchable (rather
 * than a plain <Select>) since the catalog runs to three dozen icons and a
 * flat scroll list doesn't scale — type to filter by name/label instead. */
function PerkIconSelect({ index }: { index: number }) {
  const form = useFormContext<JobPostingFormValues>();
  const value = useWatch({ control: form.control, name: `whatYouGet.${index}.icon` });
  const selected = PERK_ICON_OPTIONS.find((o) => o.key === value) ?? PERK_ICON_OPTIONS[0];

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [panelPos, setPanelPos] = useState({ top: 0, bottom: 0, left: 0, width: 288, dropUp: false });
  const PANEL_HEIGHT = 320; // search input + max-h-64 list, roughly
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest("[data-perk-icon-panel]")
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const filtered = PERK_ICON_OPTIONS.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Controller
      control={form.control}
      name={`whatYouGet.${index}.icon`}
      render={({ field }) => (
        <div ref={containerRef} className="relative">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => {
              if (!open && triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const dropUp = spaceBelow < PANEL_HEIGHT && rect.top > spaceBelow;
                setPanelPos({
                  top: rect.bottom + 4,
                  bottom: window.innerHeight - rect.top + 4,
                  left: rect.left,
                  width: Math.max(rect.width, 240),
                  dropUp,
                });
              }
              setOpen((o) => !o);
            }}
            className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <selected.Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            <span className="flex-1 truncate text-left">{selected.label}</span>
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          </button>

          {/* Portaled to <body> — a plain absolute panel here would be clipped
              by Card's `overflow-hidden`, so it's positioned fixed instead,
              computed from the trigger's actual screen position. */}
          {open && typeof document !== "undefined" && createPortal(
            <div
              data-perk-icon-panel
              style={{
                position: "fixed",
                left: panelPos.left,
                width: panelPos.width,
                ...(panelPos.dropUp ? { bottom: panelPos.bottom } : { top: panelPos.top }),
              }}
              className="z-50 rounded-md border bg-popover shadow-lg overflow-hidden"
            >
              <div className="border-b p-2">
                <Input
                  autoFocus
                  placeholder="Search icons..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="max-h-64 overflow-y-auto p-1">
                {filtered.length === 0 && (
                  <p className="px-2 py-3 text-center text-sm text-muted-foreground">No icons found.</p>
                )}
                {filtered.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      field.onChange(opt.key);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    <opt.Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                    <span className="flex-1 truncate text-left">{opt.label}</span>
                    {opt.key === field.value && <Check className="size-3.5 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>,
            document.body
          )}
        </div>
      )}
    />
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
            <PerkIconSelect index={i} />
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
