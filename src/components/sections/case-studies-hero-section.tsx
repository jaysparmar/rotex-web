import Link from "next/link";
import Image from "next/image";
import { SimpleBreadcrumb } from "@/components/ui/simple-breadcrumb";
import type { ResourceItem } from "@/lib/resource-types";

function ArrowUpRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1.5 12.5L12.5 1.5M12.5 1.5H5M12.5 1.5V9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CaseStudiesHeroSection({ featured }: { featured: ResourceItem[] }) {
  return (
    <section className="pt-28 pb-16 lg:pt-32">
      <div className="container flex flex-col gap-10">
        <SimpleBreadcrumb current="Case Studies" />

        <h1 className="w-full lg:w-162.5 text-gradient-orange-dark text-4xl font-normal font-montserrat leading-10">
          Stories behind real-world impact across industries and applications
        </h1>

        {featured.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featured.map((post) => (
              <Link
                key={post.slug}
                href={`/case-studies/${post.slug}`}
                className="group relative w-full h-122.25 p-7 rounded-2xl overflow-hidden flex flex-col justify-end items-start gap-36"
              >
                <Image src={post.image} alt={post.title} fill className="object-cover -z-10" unoptimized />
                <div className="absolute inset-0 bg-linear-to-b from-black/0 to-black/80" />

                <div className="absolute top-5 left-5 flex items-center gap-2.5">
                  {post.product && (
                    <span className="px-4 py-1 bg-zinc-100 rounded-3xl text-stone-900 text-xs font-semibold font-montserrat uppercase leading-5">
                      {post.product}
                    </span>
                  )}
                  {post.industry && (
                    <span className="px-4 py-1 bg-zinc-100 rounded-3xl text-stone-900 text-xs font-semibold font-montserrat uppercase leading-5">
                      {post.industry}
                    </span>
                  )}
                </div>

                {/* brand orange (#EF3E23) — [#EF3E23] (#dc2626) reads too dark */}
                <span className="absolute top-5 right-5 size-10 rounded-full bg-primary flex items-center justify-center text-white group-hover:rotate-45 transition-transform duration-300">
                  <ArrowUpRight />
                </span>

                <div className="relative z-10 flex flex-col gap-3">
                  <h3 className="text-white text-lg font-medium font-montserrat leading-6">
                    {post.title}
                  </h3>
                  <span className="inline-flex items-center gap-2 text-white text-sm font-semibold font-montserrat uppercase leading-5 group-hover:text-primary transition-colors duration-200">
                    Read case study
                    <ArrowUpRight />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
