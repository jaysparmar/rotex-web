"use client";

import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ChevronsUpDown, X } from "lucide-react";
import { Field } from "@/components/admin/form-fields";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export function MultiSelectField({
  name,
  label,
  options,
  placeholder,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const form = useFormContext();
  const [open, setOpen] = useState(false);
  const values = (useWatch({ control: form.control, name }) as string[] | undefined) ?? [];
  const labelByValue = new Map(options.map((o) => [o.value, o.label]));

  function toggle(value: string) {
    const next = values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
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
                {labelByValue.get(v) ?? v}
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
              {values.length ? `${values.length} selected` : placeholder ?? "Select..."}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {options.map((opt) => {
                    const checked = values.includes(opt.value);
                    return (
                      <CommandItem
                        key={opt.value}
                        value={opt.label}
                        data-checked={checked}
                        onSelect={() => toggle(opt.value)}
                      >
                        {opt.label}
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
