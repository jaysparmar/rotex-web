"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { IoChevronDownOutline, IoCheckmarkOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandInput, CommandList } from "@/components/ui/command";

export type IndustryOptionGroup = {
  name: string;
  /** Selection key for this row — slug when a caller tracks ids, otherwise falls back to `name`. */
  value?: string;
  selectable: boolean;
  subIndustries: { name: string; value?: string }[];
};

type IndustryTreeComboboxProps = {
  label: string;
  placeholder: string;
  groups: IndustryOptionGroup[];
  value: string[];
  onChange: (value: string[]) => void;
};

/** Same trigger/popup chrome as FilterCombobox, but renders options grouped by parent
 * industry with sub-industries indented underneath (collapsed by default) — mirrors the
 * admin industry tree picker. Selection is keyed by `value` (slug), not display name. */
export function IndustryTreeCombobox({ label, placeholder, groups, value, onChange }: IndustryTreeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dropUp, setDropUp] = useState(false);
  const [rect, setRect] = useState<{ top: number; bottom: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Positioned via a fixed-position portal so the panel escapes the filter
  // sidebar/sheet's overflow-y-auto instead of being clipped by it.
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setDropUp(window.innerHeight - r.bottom < 320);
    setRect({ top: r.top, bottom: r.bottom, left: r.left, width: r.width });
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement)?.closest("[data-industry-tree-panel]")
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  const handleOpen = () => {
    if (!open) updatePosition();
    setOpen((o) => !o);
  };

  const toggle = (val: string) => {
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
  };

  const q = query.trim().toLowerCase();
  const filteredGroups = q
    ? groups
        .map((g) => {
          const parentMatches = g.name.toLowerCase().includes(q);
          const subIndustries = parentMatches ? g.subIndustries : g.subIndustries.filter((s) => s.name.toLowerCase().includes(q));
          return { ...g, subIndustries };
        })
        .filter((g) => g.name.toLowerCase().includes(q) || g.subIndustries.length > 0)
    : groups;

  const labelByValue = new Map(
    groups.flatMap((g) => [
      [g.value ?? g.name, g.name] as const,
      ...g.subIndustries.map((s) => [s.value ?? s.name, s.name] as const),
    ])
  );
  const triggerLabel =
    value.length === 0
      ? placeholder
      : value.length === 1
      ? labelByValue.get(value[0]) ?? value[0]
      : `${labelByValue.get(value[0]) ?? value[0]} +${value.length - 1} more`;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-stone-500 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide">{label}</p>

      <div ref={containerRef} className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg outline outline-1 -outline-offset-1 text-sm font-medium font-montserrat leading-5 transition-colors duration-150",
            open ? "outline-stone-400" : "outline-gray-200 hover:outline-stone-300"
          )}
        >
          <span className={cn("truncate", value.length > 0 ? "text-stone-900" : "text-stone-400")}>{triggerLabel}</span>
          <IoChevronDownOutline size={12} className={cn("ml-2 shrink-0 text-stone-900 transition-transform duration-150", open && "rotate-180")} />
        </button>

        {open && rect && createPortal(
          <div
            data-industry-tree-panel
            style={{
              position: "fixed",
              left: rect.left,
              width: rect.width,
              ...(dropUp ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
            }}
            className="z-50 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
          >
            <Command shouldFilter={false}>
              <CommandInput placeholder="Search..." value={query} onValueChange={setQuery} />
              <CommandList className="max-h-72">
                {filteredGroups.length === 0 ? (
                  <CommandEmpty>No results found.</CommandEmpty>
                ) : (
                  <div className="py-1">
                    {filteredGroups.map((g) => {
                      const gVal = g.value ?? g.name;
                      return (
                        <div key={g.name}>
                          <Row
                            label={g.name}
                            checked={value.includes(gVal)}
                            onClick={() => g.selectable && toggle(gVal)}
                            selectable={g.selectable}
                            bold
                          />
                          {g.subIndustries.map((s) => {
                            const sVal = s.value ?? s.name;
                            return (
                              <Row key={sVal} label={s.name} checked={value.includes(sVal)} onClick={() => toggle(sVal)} selectable indent />
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CommandList>
            </Command>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  checked,
  onClick,
  selectable,
  bold = false,
  indent = false,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
  selectable: boolean;
  bold?: boolean;
  indent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={selectable ? onClick : undefined}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 text-sm font-montserrat text-left",
        indent && "pl-8",
        selectable ? "cursor-pointer hover:bg-stone-50 text-stone-900" : "cursor-default text-stone-500",
        bold && "font-semibold"
      )}
    >
      {selectable ? (
        <span
          className={cn(
            "size-4 shrink-0 rounded flex items-center justify-center border transition-colors duration-150",
            checked ? "bg-zinc-800 border-zinc-800" : "bg-white border-neutral-300"
          )}
        >
          {checked && <IoCheckmarkOutline size={10} className="text-white" />}
        </span>
      ) : (
        <span className="size-4 shrink-0" />
      )}
      {label}
    </button>
  );
}
