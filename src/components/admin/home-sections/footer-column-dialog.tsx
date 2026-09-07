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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, TextField, SwitchField } from "@/components/admin/form-fields";
import { Trash2, ChevronUp, ChevronDown } from "lucide-react";

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

  function toggle(id: string, checked: boolean) {
    const current: string[] = form.getValues(`${base}.selectedIds`) ?? [];
    form.setValue(`${base}.selectedIds`, checked ? [...current, id] : current.filter((v) => v !== id));
  }

  function move(id: string, direction: -1 | 1) {
    const current: string[] = form.getValues(`${base}.selectedIds`) ?? [];
    const idx = current.indexOf(id);
    const swapWith = idx + direction;
    if (idx === -1 || swapWith < 0 || swapWith >= current.length) return;
    const next = [...current];
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    form.setValue(`${base}.selectedIds`, next);
  }

  return { selected, toggle, move };
}

function IndustriesLinksPicker({
  columnIndex,
  industries,
}: {
  columnIndex: number;
  industries: IndustryOption[];
}) {
  const base = `footer.columns.${columnIndex}.source`;
  const { selected, toggle, move } = useOrderedPicker(base);

  const ordered = [...industries].sort((a, b) => {
    const aChecked = selected.includes(a.id);
    const bChecked = selected.includes(b.id);
    if (aChecked && bChecked) return selected.indexOf(a.id) - selected.indexOf(b.id);
    if (aChecked) return -1;
    if (bChecked) return 1;
    return 0;
  });

  return (
    <div className="space-y-1 rounded-lg border border-border">
      {industries.length === 0 && (
        <p className="p-4 text-sm text-muted-foreground">No industries yet. Add some on the Industries page first.</p>
      )}
      {ordered.map((industry) => {
        const checked = selected.includes(industry.id);
        const orderIdx = selected.indexOf(industry.id);
        return (
          <div key={industry.id} className="flex items-center gap-2.5 border-b border-border p-4 last:border-b-0">
            <label className="flex flex-1 items-center gap-2.5">
              <Checkbox checked={checked} onCheckedChange={(v) => toggle(industry.id, v === true)} />
              <span className="text-sm font-medium">{industry.name}</span>
            </label>
            {checked && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={orderIdx === 0}
                  onClick={() => move(industry.id, -1)}
                  className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                  <ChevronUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={orderIdx === selected.length - 1}
                  onClick={() => move(industry.id, 1)}
                  className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                  <ChevronDown className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
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
  const { selected, toggle, move } = useOrderedPicker(base);

  const ordered = [...categories].sort((a, b) => {
    const aChecked = selected.includes(a.id);
    const bChecked = selected.includes(b.id);
    if (aChecked && bChecked) return selected.indexOf(a.id) - selected.indexOf(b.id);
    if (aChecked) return -1;
    if (bChecked) return 1;
    return 0;
  });

  return (
    <div className="space-y-1 rounded-lg border border-border">
      {categories.length === 0 && (
        <p className="p-4 text-sm text-muted-foreground">No categories with products yet.</p>
      )}
      {ordered.map((category) => {
        const checked = selected.includes(category.id);
        const orderIdx = selected.indexOf(category.id);
        return (
          <div key={category.id} className="flex items-center gap-2.5 border-b border-border p-4 last:border-b-0">
            <label className="flex flex-1 items-center gap-2.5">
              <Checkbox checked={checked} onCheckedChange={(v) => toggle(category.id, v === true)} />
              <span className="text-sm font-medium">{category.name}</span>
            </label>
            {checked && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={orderIdx === 0}
                  onClick={() => move(category.id, -1)}
                  className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                  <ChevronUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={orderIdx === selected.length - 1}
                  onClick={() => move(category.id, 1)}
                  className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                  <ChevronDown className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
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
