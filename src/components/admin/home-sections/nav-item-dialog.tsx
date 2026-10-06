"use client";

import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TextField, SwitchField, FieldGrid } from "@/components/admin/form-fields";
import { MegaMenuEditor } from "@/components/admin/home-sections/mega-menu-editor";

type IndustryOption = { id: string; name: string; subIndustries: { id: string; name: string }[] };

export function NavItemDialog({
  navIndex,
  industries,
  productCategories,
  onSave,
  pending,
  trigger,
}: {
  navIndex: number;
  industries: IndustryOption[];
  productCategories: string[];
  onSave: () => Promise<void> | void;
  pending: boolean;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const form = useFormContext();
  const enabled = useWatch({ control: form.control, name: `header.nav.${navIndex}.enabled` });

  async function handleSave() {
    await onSave();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Nav Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <SwitchField
            label="Enabled"
            checked={enabled ?? false}
            onCheckedChange={(v) => form.setValue(`header.nav.${navIndex}.enabled`, v)}
          />
          <FieldGrid>
            <TextField label="Label" {...form.register(`header.nav.${navIndex}.label`)} />
            <TextField
              label="Href (fixed — tied to the site's pages)"
              readOnly
              className="cursor-not-allowed bg-muted text-muted-foreground"
              {...form.register(`header.nav.${navIndex}.href`)}
            />
          </FieldGrid>
          <MegaMenuEditor navIndex={navIndex} industries={industries} productCategories={productCategories} />
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
