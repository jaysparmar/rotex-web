"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function SectionMeta() {
  const { control } = useFormContext();

  return (
    <div className="flex items-center gap-6 rounded-lg border border-border p-4">
      <Controller
        name="enabled"
        control={control}
        render={({ field }) => (
          <div className="flex items-center gap-2.5">
            <Switch checked={field.value} onCheckedChange={field.onChange} />
            <span className="text-sm">Enabled</span>
          </div>
        )}
      />
    </div>
  );
}

export function SaveBar({ pending, error, success }: { pending: boolean; error?: string; success?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
      {error && <span className="text-sm text-destructive">{error}</span>}
      {success && <span className="text-sm text-success">Saved.</span>}
    </div>
  );
}
