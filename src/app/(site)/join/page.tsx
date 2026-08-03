import Link from "next/link";
import { RotexArrow } from "@/components/ui/rotex-arrow";

const JOIN_OPTIONS = [
  {
    slug: "channel-partner",
    title: "Become a Channel Partner",
    description: "Join Rotex's international channel partner network and deliver high-performance, application-engineered solutions.",
  },
  {
    slug: "supplier",
    title: "Become a Supplier",
    description: "Supply certified components and materials for reliable, mission-critical fluid control operations.",
  },
  {
    slug: "career",
    title: "Careers",
    description: "Be a part of our growth — explore open roles across engineering, sales, and operations.",
  },
];

export default function JoinPage() {
  return (
    <div>
      <section className="bg-stone-900 pt-28 pb-16 lg:pt-32 lg:pb-20">
        <div className="container flex flex-col gap-10">
          <nav className="flex items-center gap-3" aria-label="Breadcrumb">
            <Link
              href="/"
              className="text-subtext text-sm font-semibold font-montserrat leading-5 hover:text-white transition-colors"
            >
              Home
            </Link>
            <span className="text-subtext text-sm font-semibold font-montserrat leading-5">/</span>
            <span className="text-red-600 text-sm font-semibold font-montserrat leading-5">Join Rotex</span>
          </nav>

          <div className="flex flex-col gap-3 max-w-xl">
            <h1 className="text-gradient-hero text-4xl lg:text-6xl font-normal font-montserrat lg:leading-14.25">Join Rotex</h1>
            <p className="text-white text-base font-normal font-montserrat leading-6">
              Partner, supply, or build your career with a global leader in fluid control solutions.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 lg:py-20">
        <div className="container grid grid-cols-1 gap-5 lg:grid-cols-3">
          {JOIN_OPTIONS.map((option) => (
            <Link
              key={option.slug}
              href={`/join/${option.slug}`}
              className="group flex flex-col justify-between gap-8 p-7 rounded-2xl outline outline-1 -outline-offset-1 outline-neutral-200 hover:outline-red-600 transition-colors duration-150"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-stone-900 text-xl font-medium font-montserrat leading-8">{option.title}</h2>
                <p className="text-stone-500 text-sm font-medium font-montserrat leading-6">{option.description}</p>
              </div>
              <span className="inline-flex items-center gap-2.5 text-red-600 text-sm font-semibold font-montserrat uppercase leading-5">
                Explore
                <RotexArrow size={8} color="currentColor" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
