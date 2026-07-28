import Link from "next/link";

type SimpleBreadcrumbProps = {
  current: string;
};

export function SimpleBreadcrumb({ current }: SimpleBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-3" aria-label="Breadcrumb">
      <Link
        href="/"
        className="text-zinc-800 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide hover:text-red-600 transition-colors"
      >
        Home
      </Link>
      <span className="text-zinc-800 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide">
        /
      </span>
      <span className="text-red-600 text-xs font-semibold font-montserrat uppercase leading-4 tracking-wide">
        {current}
      </span>
    </nav>
  );
}
