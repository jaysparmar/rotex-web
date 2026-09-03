"use client";
import { useState, useRef, useEffect } from "react";
import { IoChevronDownOutline, IoCheckmarkOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { COUNTRIES } from "@/lib/world-countries";

type PhoneCodeSelectProps = {
  value: string;
  onChange: (dial: string) => void;
};

export function PhoneCodeSelect({ value, onChange }: PhoneCodeSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const selected = COUNTRIES.find((c) => c.dial === value);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-full px-3 border-r border-gray-200 flex items-center gap-1.5 shrink-0"
      >
        <span className="text-base leading-none">{selected?.flag}</span>
        <span className="text-stone-900 text-sm font-medium font-montserrat leading-5">{value}</span>
        <IoChevronDownOutline
          size={12}
          className={cn("text-stone-900 transition-transform duration-150", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-72 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList className="max-h-64">
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {COUNTRIES.map((c) => {
                  const checked = c.dial === value;
                  return (
                    <CommandItem
                      key={c.code}
                      value={`${c.name} ${c.dial}`}
                      onSelect={() => {
                        onChange(c.dial);
                        setOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium font-montserrat text-stone-900 cursor-pointer"
                    >
                      <span className="text-base leading-none">{c.flag}</span>
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="text-neutral-400 text-xs">{c.dial}</span>
                      {checked && <IoCheckmarkOutline size={14} className="text-stone-900 shrink-0" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
