import Link from "next/link";
import Image from "next/image";
import { SimpleBreadcrumb } from "@/components/ui/simple-breadcrumb";
import { formatResourceDate, type ResourceItem } from "@/lib/resource-types";

function ArrowUpRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
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

export function NewsUpdatesHeroSection({ highlighted }: { highlighted: ResourceItem[] }) {
  return (
    <section className="pt-28 pb-16 lg:pt-32">
      <div className="container flex flex-col gap-10">
        <SimpleBreadcrumb current="News & Updates" />

        <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
          <h1 className="w-full lg:w-96 text-gradient-orange-dark text-2xl lg:text-4xl font-normal font-montserrat leading-8 lg:leading-10 shrink-0">
            News & Updates You Can&apos;t Miss
          </h1>

          {/* Figma mobile: one card per row, 40px apart; two-up from sm */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-5">
            {highlighted.map((post) => (
              <Link
                key={post.slug}
                href={`/news-updates/${post.slug}`}
                className="group w-full p-5 bg-white rounded-xl outline-1 -outline-offset-1 outline-neutral-200 flex flex-col gap-5"
              >
                {/* Figma: thumbnail beside the arrow — 208×94 mobile, 171×94 desktop */}
                <div className="self-stretch flex justify-between items-start gap-3">
                  <span className="relative w-52 lg:w-44 h-24 rounded-lg overflow-hidden shrink-0">
                    <Image src={post.image} alt={post.title} fill className="object-cover" unoptimized />
                  </span>
                  {/* brand orange (#ee3e23), not red-600 (#dc2626) which reads too dark */}
                  <span className="size-10 lg:size-8 shrink-0 rounded-full bg-primary flex items-center justify-center text-white group-hover:rotate-45 transition-transform duration-300">
                    <ArrowUpRight />
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {/* stone-400 (#a8a29e) — the theme overrides neutral-400 to a dark #4a5565 */}
                  <span className="text-stone-400 text-sm font-semibold font-montserrat uppercase leading-6 lg:leading-5">
                    {formatResourceDate(post.createdAt)}
                  </span>
                  <h3 className="text-stone-900 text-base lg:text-lg font-medium font-montserrat leading-6">
                    {post.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
