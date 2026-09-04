import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AdminPagination({
  page,
  totalPages,
  total,
  itemLabel,
  itemLabelPlural,
  pageHref,
}: {
  page: number;
  totalPages: number;
  total: number;
  itemLabel: string;
  itemLabelPlural?: string;
  pageHref: (page: number) => string;
}) {
  const label = total === 1 ? itemLabel : (itemLabelPlural ?? `${itemLabel}s`);
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        {total} {label} · Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Link href={pageHref(Math.max(1, page - 1))} aria-disabled={page <= 1}>
          <Button variant="outline" size="sm" disabled={page <= 1}>
            Previous
          </Button>
        </Link>
        <Link href={pageHref(Math.min(totalPages, page + 1))} aria-disabled={page >= totalPages}>
          <Button variant="outline" size="sm" disabled={page >= totalPages}>
            Next
          </Button>
        </Link>
      </div>
    </div>
  );
}
