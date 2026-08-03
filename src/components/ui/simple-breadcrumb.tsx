import Link from "next/link";

type SimpleBreadcrumbProps = {
  current: string;
};

export function SimpleBreadcrumb({ current }: SimpleBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-3" aria-label="Breadcrumb">
      <Link
        href="/"
        className="text-zinc-800 text-sm font-semibold font-montserrat leading-5 hover:text-red-600 transition-colors"
      >
        Home
      </Link>
      <span className="text-zinc-800 text-sm font-semibold font-montserrat leading-5">
        /
      </span>
      <span className="text-red-600 text-sm font-semibold font-montserrat leading-5">
        {current}
      </span>
    </nav>
  );
}
