import Link from "next/link";

type AboutHeroSectionProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

/* Figma: 1440×720 canvas */
export function AboutHeroSection({ title, description, children }: AboutHeroSectionProps) {
  return (
    <section className="relative w-full flex justify-center overflow-hidden bg-stone-900">
      <div className="relative w-full max-w-360 lg:h-180">
        {/* Decorative outline — Figma: 607×576, left 417, top 112 */}
        <svg
          className="hidden lg:block absolute w-151.75 h-144 left-104.25 top-28"
          width="607"
          height="576"
          viewBox="0 0 607 576"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            opacity="0.3"
            d="M302.728 0.5C346.58 0.500023 386.945 7.66605 424.223 22.0127L424.225 22.0137C460.91 35.9422 492.543 55.6898 519.494 81.0703L520.774 82.2832C547.991 108.256 569.041 138.676 584.101 173.557C599.152 208.437 606.5 246.603 606.5 287.897C606.5 329.192 599.156 367.365 584.101 402.245V402.246C569.046 437.323 547.807 467.741 520.39 493.706C492.963 519.482 460.718 539.639 423.834 553.987C386.948 568.326 347.362 575.5 303.506 575.5C259.649 575.5 219.478 568.326 182.791 553.988C146.66 539.864 115.225 520.113 88.29 494.912L87.0107 493.708C59.9715 467.742 38.7385 437.32 23.2842 402.628C8.03319 367.949 0.500056 329.183 0.5 287.897C0.5 246.613 8.03223 208.44 23.2813 173.171C38.7359 137.9 59.9692 107.48 87.0068 81.8955C114.227 56.1201 146.085 36.1627 182.785 22.0127L182.787 22.0117C219.475 7.66567 258.876 0.5 302.728 0.5ZM222.843 127.235C214.141 127.235 206.056 132.001 201.521 139.719L201.518 139.723L124.72 273.086L124.717 273.091C120.372 280.817 120.369 290.322 124.72 297.853L201.518 431.426L201.523 431.435C206.056 438.955 214.139 443.708 222.843 443.708L376.427 443.708C385.505 443.708 393.408 438.953 397.744 431.427V431.426L474.541 297.853L474.542 297.854C478.893 290.323 478.89 280.813 474.545 273.091L474.542 273.086L397.744 139.723H397.743C393.403 131.998 385.505 127.235 376.427 127.235L222.843 127.235Z"
            stroke="#a8a29e"
          />
        </svg>

        {/* Breadcrumb — Figma: left 85, top 120 */}
        <nav
          className="relative lg:absolute flex items-center gap-3 px-6 pt-10 lg:px-0 lg:pt-0 lg:left-21.25 lg:top-30"
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className="text-white text-sm font-semibold font-montserrat leading-5 hover:text-zinc-200 transition-colors"
          >
            Home
          </Link>
          <span className="text-white text-sm font-semibold font-montserrat leading-5">
            /
          </span>
          <span className="text-red-600 text-sm font-semibold font-montserrat leading-5">
            About Us
          </span>
        </nav>

        {/* Title + description + CTA — Figma: title top 304, w 555; description top 416, w 772; button top 546 */}
        {/* Figma mobile: left-aligned block at x=20, 24px title, 14px body */}
        <div className="relative lg:absolute flex flex-col items-stretch lg:items-center gap-4 lg:gap-8 px-5 py-15 lg:px-0 lg:py-0 lg:left-1/2 lg:top-76 lg:-translate-x-1/2 lg:w-193">
          <h1 className="lg:w-138.75 text-left lg:text-center text-gradient-hero text-2xl lg:text-4xl font-normal lg:font-medium font-montserrat leading-8 lg:leading-10">
            {title}
          </h1>
          {description && (
            <p className="text-left lg:text-center text-white text-sm lg:text-base font-medium lg:font-normal font-montserrat leading-5 lg:leading-6">
              {description}
            </p>
          )}
          <div className="mt-4 lg:mt-2 flex">{children}</div>
        </div>
      </div>
    </section>
  );
}
