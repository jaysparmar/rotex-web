"use client";

import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ChevronsUpDown, X } from "lucide-react";
import { Field } from "@/components/admin/form-fields";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export function CertificatesSelect({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: string[];
}) {
  const form = useFormContext();
  const [open, setOpen] = useState(false);
  const values = (useWatch({ control: form.control, name }) as string[] | undefined) ?? [];

  function toggle(option: string) {
    const next = values.includes(option) ? values.filter((v) => v !== option) : [...values, option];
    form.setValue(name, next, { shouldDirty: true });
  }

  function removeAt(index: number) {
    form.setValue(
      name,
      values.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  }

  return (
    <Field label={label}>
      <div className="space-y-2">
        {values.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {values.map((v, i) => (
              <Badge key={`${v}-${i}`} variant="secondary" className="gap-1 py-1 pr-1">
                {v}
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-lg border border-border bg-background px-3 text-sm transition-colors hover:bg-muted",
              open && "bg-muted"
            )}
          >
            <span className="text-muted-foreground">
              {values.length ? `${values.length} selected` : "Select certificates..."}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search certificates..." />
              <CommandList>
                <CommandEmpty>No certificates found.</CommandEmpty>
                <CommandGroup>
                  {options.map((opt) => {
                    const checked = values.includes(opt);
                    return (
                      <CommandItem key={opt} value={opt} data-checked={checked} onSelect={() => toggle(opt)}>
                        {opt}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </Field>
  );
}
