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
        className="text-zinc-800 text-sm font-semibold font-montserrat leading-5 hover:text-red-600 transition-colors"
      >
        Home
      </Link>
      <span className="text-zinc-800 text-sm font-semibold font-montserrat leading-5">/</span>
      <Link
        href={typeHref}
        className="text-zinc-800 text-sm font-semibold font-montserrat leading-5 hover:text-red-600 transition-colors"
      >
        {typeLabel}
      </Link>
      <span className="text-stone-900 text-sm font-semibold font-montserrat leading-5">/</span>
      <span className="w-72 text-red-600 text-sm font-semibold font-montserrat leading-5 line-clamp-1">
        {title}
      </span>
    </nav>
  );
}
