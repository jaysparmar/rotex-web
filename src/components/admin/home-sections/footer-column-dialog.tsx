"use client";

import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, TextField, SwitchField } from "@/components/admin/form-fields";
import { OrderedCheckboxPicker } from "@/components/admin/ordered-checkbox-picker";
import { Trash2 } from "lucide-react";

type IndustryOption = { id: string; name: string };
type CategoryOption = { id: string; name: string };

type Mode = "manual" | "industries" | "categories";

const MODE_LABELS: Record<Mode, string> = {
  manual: "Manual links",
  industries: "Industries (live data, main only)",
  categories: "Product Categories (live data)",
};

export function FooterColumnDialog({
  columnIndex,
  industries,
  categories,
  onSave,
  pending,
  trigger,
}: {
  columnIndex: number;
  industries: IndustryOption[];
  categories: CategoryOption[];
  onSave: () => Promise<void> | void;
  pending: boolean;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const form = useFormContext();
  const base = `footer.columns.${columnIndex}`;
  const enabled = useWatch({ control: form.control, name: `${base}.enabled` });
  const sourceType = useWatch({ control: form.control, name: `${base}.source.type` });
  const mode: Mode = sourceType === "industries" || sourceType === "categories" ? sourceType : "manual";

  function setMode(newMode: Mode) {
    if (newMode === "manual") {
      form.setValue(`${base}.source`, null);
    } else {
      form.setValue(`${base}.source`, { type: newMode, selectedIds: [] });
      form.setValue(`${base}.links`, []);
    }
  }

  async function handleSave() {
    await onSave();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Footer Column</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <SwitchField
            label="Enabled"
            checked={enabled}
            onCheckedChange={(v) => form.setValue(`${base}.enabled`, v)}
          />
          <TextField label="Heading" {...form.register(`${base}.heading`)} />

          <Field label="Links Source">
            <Select items={MODE_LABELS} value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MODE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {mode === "industries" ? (
            <IndustriesLinksPicker columnIndex={columnIndex} industries={industries} />
          ) : mode === "categories" ? (
            <CategoriesLinksPicker columnIndex={columnIndex} categories={categories} />
          ) : (
            <ManualLinksEditor columnIndex={columnIndex} />
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={pending}>
            {pending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function useOrderedPicker(base: string) {
  const form = useFormContext();
  const selected: string[] = useWatch({ control: form.control, name: `${base}.selectedIds` }) ?? [];

  function setSelected(ids: string[]) {
    form.setValue(`${base}.selectedIds`, ids);
  }

  return { selected, setSelected };
}

function IndustriesLinksPicker({
  columnIndex,
  industries,
}: {
  columnIndex: number;
  industries: IndustryOption[];
}) {
  const base = `footer.columns.${columnIndex}.source`;
  const { selected, setSelected } = useOrderedPicker(base);

  return (
    <OrderedCheckboxPicker
      items={industries.map((i) => ({ id: i.id, label: i.name }))}
      selected={selected}
      onChange={setSelected}
      emptyMessage="No industries yet. Add some on the Industries page first."
    />
  );
}

function CategoriesLinksPicker({
  columnIndex,
  categories,
}: {
  columnIndex: number;
  categories: CategoryOption[];
}) {
  const base = `footer.columns.${columnIndex}.source`;
  const { selected, setSelected } = useOrderedPicker(base);

  return (
    <OrderedCheckboxPicker
      items={categories.map((c) => ({ id: c.id, label: c.name }))}
      selected={selected}
      onChange={setSelected}
      emptyMessage="No categories with products yet."
    />
  );
}

function ManualLinksEditor({ columnIndex }: { columnIndex: number }) {
  const form = useFormContext();
  const name = `footer.columns.${columnIndex}.links`;
  const { fields, remove } = useFieldArray({ control: form.control, name });

  return (
    <div className="space-y-2 border-t border-border pt-3">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Links</span>
      {fields.map((field, j) => (
        <div key={field.id} className="flex items-end gap-2">
          <TextField label="Label" {...form.register(`${name}.${j}.label`)} />
          <TextField label="Href" {...form.register(`${name}.${j}.href`)} />
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(j)} className="mb-1">
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
}
