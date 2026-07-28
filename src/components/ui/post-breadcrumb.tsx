import Link from "next/link";

type PostBreadcrumbProps = {
  typeLabel: string;
  typeHref: string;
  title: string;
};

export function PostBreadcrumb({ typeLabel, typeHref, title }: PostBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-3" aria-label="Breadcrumb">
      <Link
        href="/"
        className="text-zinc-800 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide hover:text-red-600 transition-colors"
      >
        Home
      </Link>
      <span className="text-zinc-800 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide">/</span>
      <Link
        href={typeHref}
        className="text-zinc-800 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide hover:text-red-600 transition-colors"
      >
        {typeLabel}
      </Link>
      <span className="text-stone-900 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide">/</span>
      <span className="w-72 text-red-600 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide line-clamp-1">
        {title}
      </span>
    </nav>
  );
}
