"use client";
import { useState, useRef, useEffect, useCallback } from "react";
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

type FilterComboboxProps = {
  label: string;
  placeholder: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  /** When false, selecting an option replaces the current selection instead of toggling it. Defaults to true. */
  multiple?: boolean;
};

export function FilterCombobox({ label, placeholder, options, value, onChange, multiple = true }: FilterComboboxProps) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [rect, setRect] = useState<{ top: number; bottom: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Positioned via a fixed-position portal (not absolute inside the trigger's
  // own container) so the panel escapes the filter sidebar/sheet's
  // overflow-y-auto instead of being clipped by it.
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setDropUp(window.innerHeight - r.bottom < 280);
    setRect({ top: r.top, bottom: r.bottom, left: r.left, width: r.width });
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement)?.closest("[data-filter-combobox-panel]")
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

  const toggle = (opt: string) => {
    if (!multiple) {
      onChange(value.includes(opt) ? [] : [opt]);
      setOpen(false);
      return;
    }
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  };

  const triggerLabel =
    value.length === 0
      ? placeholder
      : value.length === 1
      ? value[0]
      : `${value[0]} +${value.length - 1} more`;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-stone-500 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide">
        {label}
      </p>

      <div ref={containerRef} className="relative">
        {/* Trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg outline outline-1 -outline-offset-1 text-sm font-medium font-montserrat leading-5 transition-colors duration-150",
            open ? "outline-stone-400" : "outline-gray-200 hover:outline-stone-300"
          )}
        >
          <span className={cn("truncate", value.length > 0 ? "text-stone-900" : "text-stone-400")}>
            {triggerLabel}
          </span>
          <IoChevronDownOutline
            size={12}
            className={cn(
              "ml-2 shrink-0 text-stone-900 transition-transform duration-150",
              open && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown — fixed-position portal so it isn't clipped by a scrolling ancestor */}
        {open && rect && createPortal(
          <div
            data-filter-combobox-panel
            style={{
              position: "fixed",
              left: rect.left,
              width: rect.width,
              ...(dropUp ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
            }}
            className="z-50 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
          >
            <Command>
              <CommandInput placeholder="Search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {options.map((opt) => {
                    const checked = value.includes(opt);
                    return (
                      <CommandItem
                        key={opt}
                        value={opt}
                        data-checked={checked}
                        onSelect={() => toggle(opt)}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium font-montserrat text-stone-900 cursor-pointer data-selected:bg-transparent hover:bg-stone-50"
                      >
                        <span
                          className={cn(
                            "size-4 shrink-0 rounded flex items-center justify-center border transition-colors duration-150",
                            checked ? "bg-zinc-800 border-zinc-800" : "bg-white border-neutral-300"
                          )}
                        >
                          {checked && <IoCheckmarkOutline size={10} className="text-white" />}
                        </span>
                        {opt}
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
    </div>
  );
}
