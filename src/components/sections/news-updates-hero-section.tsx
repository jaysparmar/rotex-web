import Link from "next/link";
import Image from "next/image";
import { SimpleBreadcrumb } from "@/components/ui/simple-breadcrumb";
import { RESOURCE_POSTS } from "@/lib/resources-data";

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

const highlighted = RESOURCE_POSTS.slice(0, 4);

export function NewsUpdatesHeroSection() {
  return (
    <section className="pt-28 pb-16 lg:pt-32">
      <div className="container flex flex-col gap-10">
        <SimpleBreadcrumb current="News & Updates" />

        <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
          <h1 className="w-full lg:w-96 text-gradient-orange-dark text-4xl font-normal font-montserrat leading-10 shrink-0">
            News & Updates You Can&apos;t Miss
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {highlighted.map((post) => (
              <Link
                key={post.slug}
                href={`/news-updates/${post.slug}`}
                className="group w-80 p-5 rounded-xl outline-1 -outline-offset-1 outline-neutral-200 flex flex-col gap-5"
              >
                <div className="self-stretch flex justify-between items-start">
                  <span className="relative w-44 h-24 rounded-lg overflow-hidden shrink-0">
                    <Image src={post.image} alt={post.title} fill className="object-cover" />
                  </span>
                  <span className="size-8 rounded-full bg-red-600 flex items-center justify-center text-white group-hover:rotate-45 transition-transform duration-300">
                    <ArrowUpRight />
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-neutral-400 text-sm font-semibold font-montserrat uppercase leading-5">
                    {post.date}
                  </span>
                  <h3 className="text-stone-900 text-lg font-medium font-montserrat leading-6">{post.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
