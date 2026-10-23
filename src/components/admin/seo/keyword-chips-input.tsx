"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

/** Type a keyword, press Enter or comma (or paste a comma-separated list) to add it as a chip. */
export function KeywordChipsInput({ value, onChange }: { value: string[]; onChange: (keywords: string[]) => void }) {
  const [draft, setDraft] = useState("");

  function addFrom(raw: string) {
    const next = raw
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v && !value.includes(v));
    if (next.length > 0) onChange([...value, ...next]);
  }

  function commit() {
    if (!draft.trim()) return;
    addFrom(draft);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <Input
        placeholder="Type a keyword, press Enter or comma..."
        value={draft}
        onChange={(e) => {
          const v = e.target.value;
          if (v.includes(",")) {
            addFrom(v);
            setDraft("");
          } else {
            setDraft(v);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={commit}
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((kw, i) => (
            <span
              key={`${kw}-${i}`}
              className="flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium"
            >
              {kw}
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
