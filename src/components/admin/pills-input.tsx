"use client";

import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { X } from "lucide-react";
import { Field } from "@/components/admin/form-fields";
import { Input } from "@/components/ui/input";

export function PillsInput({ name, label }: { name: string; label: string }) {
  const form = useFormContext();
  const [draft, setDraft] = useState("");
  const values = (useWatch({ control: form.control, name }) as string[] | undefined) ?? [];

  function commitDraft() {
    const parts = draft
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    form.setValue(name, [...values, ...parts], { shouldDirty: true });
    setDraft("");
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
              <span
                key={`${v}-${i}`}
                className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 py-1 pl-3 pr-1.5 text-sm"
              >
                {v}
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <Input
          value={draft}
          onChange={(e) => {
            const next = e.target.value;
            if (next.includes(",")) {
              const parts = next.split(",");
              const trailing = parts.pop() ?? "";
              const newPills = parts.map((p) => p.trim()).filter(Boolean);
              if (newPills.length) form.setValue(name, [...values, ...newPills], { shouldDirty: true });
              setDraft(trailing);
            } else {
              setDraft(next);
            }
          }}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitDraft();
            }
          }}
          placeholder="Type a value and press comma or Enter..."
          className="h-9"
        />
      </div>
    </Field>
  );
}
