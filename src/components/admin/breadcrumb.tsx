import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  const [first, ...rest] = items;

  return (
    <nav className="flex shrink-0 items-center gap-1.5 text-sm">
      {first.href && (
        <Link
          href={first.href}
          className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          {first.label}
        </Link>
      )}

      {rest.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="size-3.5 text-muted-foreground" />
          {item.href ? (
            <Link href={item.href} className="text-muted-foreground transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
