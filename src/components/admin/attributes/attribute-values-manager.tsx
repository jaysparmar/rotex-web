"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { createAttributeValue, deleteAttributeValue } from "@/app/admin/(dashboard)/attributes/actions";
import type { ProductAttributeKey } from "@/lib/product-constants";

type AttributeValueRow = { id: string; value: string };
type AttributeGroup = { key: ProductAttributeKey; label: string; values: AttributeValueRow[] };

export function AttributeValuesManager({ groups }: { groups: AttributeGroup[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {groups.map((group) => (
        <AttributeGroupCard key={group.key} group={group} />
      ))}
    </div>
  );
}

function AttributeGroupCard({ group }: { group: AttributeGroup }) {
  const [pending, startTransition] = useTransition();
  const [input, setInput] = useState("");

  function handleAdd() {
    const value = input.trim();
    if (!value) return;
    startTransition(async () => {
      try {
        await createAttributeValue(group.key, value);
        setInput("");
      } catch {
        toast.error(`Failed to add "${value}"`);
      }
    });
  }

  function handleRemove(id: string, value: string) {
    startTransition(async () => {
      try {
        await deleteAttributeValue(id);
      } catch {
        toast.error(`Failed to remove "${value}"`);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{group.label}</CardTitle>
        <CardDescription>{group.values.length} value{group.values.length === 1 ? "" : "s"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {group.values.length === 0 && <p className="text-sm text-muted-foreground">No values yet.</p>}
          {group.values.map((v) => (
            <span
              key={v.id}
              className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 py-1 pl-3 pr-1.5 text-sm"
            >
              {v.value}
              <button
                type="button"
                disabled={pending}
                onClick={() => handleRemove(v.id, v.value)}
                className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder={`Add a ${group.label.toLowerCase()} value...`}
            className="h-9"
          />
          <Button type="button" size="sm" variant="outline" disabled={pending} onClick={handleAdd} className="shrink-0 gap-1.5">
            <Plus className="size-3.5" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
