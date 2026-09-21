"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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

const PANEL_HEIGHT = 280; // search input + max-h-64 list, roughly

export function PhoneCodeSelect({ value, onChange }: PhoneCodeSelectProps) {
  const [open, setOpen] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, bottom: 0, left: 0, width: 288, dropUp: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest("[data-phone-code-panel]")
      ) {
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
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropUp = spaceBelow < PANEL_HEIGHT && rect.top > spaceBelow;
            setPanelPos({
              top: rect.bottom + 4,
              bottom: window.innerHeight - rect.top + 4,
              left: rect.left,
              width: Math.max(rect.width, 288),
              dropUp,
            });
          }
          setOpen((o) => !o);
        }}
        className="h-full px-3 border-r border-gray-200 flex items-center gap-1.5 shrink-0"
      >
        <span className="text-base leading-none">{selected?.flag}</span>
        <span className="text-stone-900 text-sm font-medium font-montserrat leading-5">{value}</span>
        <IoChevronDownOutline
          size={12}
          className={cn("text-stone-900 transition-transform duration-150", open && "rotate-180")}
        />
      </button>

      {/* Portaled to <body> — a plain absolute panel here would be clipped by
          the phone row's own `overflow-hidden` (used to clip the pill's
          rounded corners), so it's positioned fixed instead, computed from
          the trigger's actual screen position, with a viewport-aware flip. */}
      {open && typeof document !== "undefined" && createPortal(
        <div
          data-phone-code-panel
          style={{
            position: "fixed",
            left: panelPos.left,
            width: panelPos.width,
            ...(panelPos.dropUp ? { bottom: panelPos.bottom } : { top: panelPos.top }),
          }}
          className="z-50 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
        >
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
        </div>,
        document.body
      )}
    </div>
  );
}
