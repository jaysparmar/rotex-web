"use client";

import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ImportProductsButton() {
  return (
    <Button size="sm" variant="outline" className="gap-1.5" disabled title="Bulk import — coming soon">
      <Upload className="size-3.5" />
      Upload Excel
    </Button>
  );
}
