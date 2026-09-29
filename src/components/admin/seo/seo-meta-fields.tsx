"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { TextField, TextAreaField } from "@/components/admin/form-fields";
import { cn } from "@/lib/utils";

function counterClassName(length: number, guideline: number, max: number): string {
  if (length > max) return "text-destructive";
  if (length > guideline) return "text-amber-500";
  return "text-muted-foreground";
}

export function TitleField({
  name,
  label = "Title",
  guideline = 60,
  max = 70,
}: {
  name: string;
  label?: string;
  guideline?: number;
  max?: number;
}) {
  const form = useFormContext();
  const value = useWatch({ control: form.control, name }) as string | undefined;
  const length = value?.length ?? 0;

  return (
    <div className="space-y-1.5">
      <TextField label={label} {...form.register(name)} />
      <p className={cn("text-xs", counterClassName(length, guideline, max))}>
        {length} / {guideline} characters
      </p>
    </div>
  );
}

export function DescriptionField({
  name,
  label = "Description",
  guideline = 160,
  max = 180,
}: {
  name: string;
  label?: string;
  guideline?: number;
  max?: number;
}) {
  const form = useFormContext();
  const value = useWatch({ control: form.control, name }) as string | undefined;
  const length = value?.length ?? 0;

  return (
    <div className="space-y-1.5">
      <TextAreaField label={label} rows={3} {...form.register(name)} />
      <p className={cn("text-xs", counterClassName(length, guideline, max))}>
        {length} / {guideline} characters
      </p>
    </div>
  );
}
