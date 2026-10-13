import Link from "next/link";

type PostBreadcrumbProps = {
  typeLabel: string;
  typeHref: string;
  title: string;
};

export function PostBreadcrumb({ typeLabel, typeHref, title }: PostBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-3 min-w-0" aria-label="Breadcrumb">
      <Link
        href="/"
        className="shrink-0 text-zinc-800 text-sm font-semibold font-montserrat leading-5 hover:text-[#EF3E23] transition-colors"
      >
        Home
      </Link>
      <span className="shrink-0 text-zinc-800 text-sm font-semibold font-montserrat leading-5">/</span>
      <Link
        href={typeHref}
        className="shrink-0 text-zinc-800 text-sm font-semibold font-montserrat leading-5 hover:text-[#EF3E23] transition-colors"
      >
        {typeLabel}
      </Link>
      <span className="shrink-0 text-stone-900 text-sm font-semibold font-montserrat leading-5">/</span>
      {/* flex-1/min-w-0/truncate so this fills (and is bounded by) whatever space
          is left after the fixed segments, instead of a hardcoded w-72 that
          overflowed the viewport once Home/type-label took their own space. */}
      <span className="min-w-0 flex-1 truncate text-[#EF3E23] text-sm font-semibold font-montserrat leading-5">
        {title}
      </span>
    </nav>
  );
}
