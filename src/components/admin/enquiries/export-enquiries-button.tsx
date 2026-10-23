"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { exportEnquiriesCsv } from "@/app/admin/(dashboard)/enquiries/actions";

function downloadCsv(filename: string, csv: string) {
  // Leading BOM so Excel opens UTF-8 CSVs without mangling non-ASCII text.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ExportEnquiriesButton({ tabs, active }: { tabs: string[]; active: string }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set([active]));
  const [pending, startTransition] = useTransition();

  function toggle(tab: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tab)) next.delete(tab);
      else next.add(tab);
      return next;
    });
  }

  function runExport() {
    const picked = Array.from(selected);
    if (picked.length === 0) {
      toast.error("Pick at least one tab to export");
      return;
    }
    startTransition(async () => {
      try {
        const { filename, csv } = await exportEnquiriesCsv(picked);
        downloadCsv(filename, csv);
        toast.success(`Exported ${filename}`);
        setOpen(false);
      } catch {
        toast.error("Export failed");
      }
    });
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSelected(new Set([active]));
      }}
    >
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="size-3.5" />
            Export CSV
          </Button>
        }
      />
      <PopoverContent align="end" className="w-64 p-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Tabs to export</p>
        <div className="max-h-56 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <label key={tab} className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-muted">
              <Checkbox checked={selected.has(tab)} onCheckedChange={() => toggle(tab)} />
              <span className="truncate">{tab}</span>
            </label>
          ))}
        </div>
        <Button size="sm" className="mt-3 w-full" disabled={pending} onClick={runExport}>
          {pending ? "Exporting…" : `Export ${selected.size || ""} CSV`.trim()}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
