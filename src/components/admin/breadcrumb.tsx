import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  const [first, ...rest] = items;

  return (
    <nav className="flex min-w-0 max-w-full flex-wrap items-center justify-end gap-x-1.5 gap-y-1 text-sm">
      {first.href && (
        <Link
          href={first.href}
          className="flex shrink-0 items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          {first.label}
        </Link>
      )}

      {rest.map((item, i) => (
        <span key={i} className="flex min-w-0 items-center gap-1.5">
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
          {item.href ? (
            <Link
              href={item.href}
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ) : (
            <span className="break-words font-medium text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
