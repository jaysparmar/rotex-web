"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DateRangePicker({
  from,
  to,
  onChange,
}: {
  from?: Date;
  to?: Date;
  onChange: (range: { from?: Date; to?: Date }) => void;
}) {
  const [open, setOpen] = useState(false);
  const range: DateRange | undefined = from || to ? { from, to } : undefined;

  function label() {
    if (from && to) return `${format(from, "dd MMM yyyy")} – ${format(to, "dd MMM yyyy")}`;
    if (from) return `From ${format(from, "dd MMM yyyy")}`;
    if (to) return `Until ${format(to, "dd MMM yyyy")}`;
    return "Filter by date";
  }

  return (
    <div className="flex items-center gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className={cn("gap-1.5", !from && !to && "text-muted-foreground")}
            >
              <CalendarIcon className="size-3.5" />
              {label()}
            </Button>
          }
        />
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="range"
            defaultMonth={from ?? to}
            selected={range}
            onSelect={(next) => onChange({ from: next?.from, to: next?.to })}
            numberOfMonths={2}
            disabled={{ after: new Date() }}
          />
        </PopoverContent>
      </Popover>

      {(from || to) && (
        <Button
          variant="ghost"
          size="icon-sm"
          title="Clear date filter"
          onClick={() => onChange({ from: undefined, to: undefined })}
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
