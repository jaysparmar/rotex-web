import Link from "next/link";
import { ArticleCard } from "@/components/ui/article-card";

type CaseStudy = { slug: string; title: string; image: string };

type AboutCaseStudiesSectionProps = {
  heading?: string;
  studies?: CaseStudy[];
  cta?: { label: string; href: string };
};

const defaultStudies: CaseStudy[] = [
  {
    slug: "solenoid-valve-classification",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    title: "Solenoid Valve Classification: The Engineering Logic Behind Reliable Automation Systems",
  },
  {
    slug: "future-of-industrial-valves",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80",
    title: "Future of Industrial Valves: 7 Rotex Technologies Improving Reliability & Uptime",
  },
  {
    slug: "select-the-right-solenoid-valve",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80",
    title: "How to Select the Right Solenoid Valve for Your Industrial Process?",
  },
];

export function AboutCaseStudiesSection({
  heading = "Case Studies",
  studies = defaultStudies,
  cta = { label: "Read All Case Studies", href: "/case-studies" },
}: AboutCaseStudiesSectionProps) {
  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="container">
        <div className="flex items-end justify-between mb-8 lg:mb-10">
          <h2 className="font-montserrat font-normal text-2xl lg:text-4xl leading-8 lg:leading-10">
            <span className="text-gradient-orange-dark">{heading}</span>
          </h2>
          <Link
            href={cta.href}
            className="hidden lg:inline-block text-[#EF3E23] font-montserrat font-semibold text-sm uppercase hover:text-red-700 transition-colors"
          >
            {cta.label}
          </Link>
        </div>

        <div className="no-scrollbar flex lg:grid lg:grid-cols-3 gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory -mx-5 px-5 lg:mx-0 lg:px-0" style={{ scrollbarWidth: "none" }}>
          {studies.map((s) => (
            <ArticleCard
              key={s.slug}
              image={s.image}
              title={s.title}
              href={`/case-studies/${s.slug}`}
              className="w-64 shrink-0 snap-center lg:w-auto"
            />
          ))}
        </div>

        <div className="flex lg:hidden justify-center mt-8">
          <Link
            href={cta.href}
            className="inline-flex justify-center items-center gap-3.5 px-6 py-3.5 rounded-full bg-stone-900 text-white font-montserrat font-semibold text-sm uppercase leading-5 hover:bg-stone-800 transition-colors duration-150"
          >
            {cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
