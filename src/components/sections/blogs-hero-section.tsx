import Link from "next/link";
import Image from "next/image";
import { SimpleBreadcrumb } from "@/components/ui/simple-breadcrumb";
import { formatResourceDate, type ResourceItem } from "@/lib/resource-types";

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

export function BlogsHeroSection({ featured }: { featured?: ResourceItem }) {
  return (
    <section className="pt-28 pb-16 lg:pt-32">
      <div className="container flex flex-col gap-14">
        <SimpleBreadcrumb current="Blogs" />

        {featured && (
          /* Featured post — narrower than the container and centred */
          <div className="group flex flex-col lg:flex-row items-stretch rounded-lg overflow-hidden outline-1 -outline-offset-1 outline-neutral-200 lg:max-w-3xl lg:mx-auto">
            <Link href={`/blogs/${featured.slug}`} className="relative w-full lg:w-96 h-64 lg:h-80 shrink-0">
              <Image src={featured.image} alt={featured.title} fill className="object-cover" unoptimized />
              <span className="absolute top-4 right-4 size-10 rounded-full bg-red-600 flex items-center justify-center text-white group-hover:rotate-45 transition-transform duration-300">
                <ArrowUpRight />
              </span>
            </Link>
            <div className="flex-1 p-8 flex flex-col justify-center gap-5">
              <div className="flex flex-col gap-5">
                <span className="text-neutral-400 text-sm font-semibold font-montserrat uppercase leading-5">
                  {formatResourceDate(featured.createdAt)}
                </span>
                <h2 className="text-stone-900 text-lg font-medium font-montserrat leading-6">{featured.title}</h2>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
