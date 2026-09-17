import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type FilterChip = { key: string; label: string; value: string };

/**
 * Removable active-filter badge row + "Clear all", shared by every admin
 * listing page. Each page builds its own `chips` array (resolving raw param
 * values to display labels, e.g. an id to a name, stays page-specific).
 */
export function FilterChips({
  chips,
  onRemove,
  onClearAll,
}: {
  chips: FilterChip[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <Badge key={chip.key} variant="outline" className="gap-1 pr-1">
          {chip.label}: {chip.value}
          <button
            type="button"
            className="rounded-full p-0.5 hover:bg-muted"
            onClick={() => onRemove(chip.key)}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <button
        type="button"
        className="text-xs text-muted-foreground underline-offset-2 hover:underline"
        onClick={onClearAll}
      >
        Clear all
      </button>
    </div>
  );
}
