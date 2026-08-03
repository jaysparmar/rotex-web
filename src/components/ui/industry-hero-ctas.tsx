"use client";

/* Figma mobile: full-width stacked pills, gap-2.5; desktop: inline, gap-5 */
const btnClass =
  "w-full lg:w-auto px-5 py-2.5 rounded-[100px] outline outline-1 -outline-offset-1 outline-stone-500 text-white text-xs font-semibold font-montserrat uppercase leading-5 hover:bg-white/10 transition-colors duration-200";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function IndustryHeroCtas() {
  return (
    <div className="flex flex-col lg:flex-row lg:flex-wrap gap-2.5 lg:gap-5">
      <button className={btnClass} onClick={() => scrollTo("enquiry-form")}>
        Talk to an Expert
      </button>
      <button className={btnClass} onClick={() => scrollTo("recommended-products")}>
        See Recommended Products
      </button>
    </div>
  );
}
