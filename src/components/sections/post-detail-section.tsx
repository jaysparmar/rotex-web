import Image from "next/image";
import { FaFacebookF, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";
import { PostBreadcrumb } from "@/components/ui/post-breadcrumb";
import { getPostDetail, getPostTags, type ResourcePost } from "@/lib/resources-data";

type PostDetailSectionProps = {
  post: ResourcePost;
  typeLabel: string;
  typeSingular: string;
  typeHref: string;
};

export function PostDetailSection({ post, typeLabel, typeSingular, typeHref }: PostDetailSectionProps) {
  const detail = getPostDetail(post);
  const tags = getPostTags(post);

  return (
    <section className="pt-28 pb-16 lg:pt-32">
      <div className="container flex flex-col gap-10">
        <PostBreadcrumb typeLabel={typeLabel} typeHref={typeHref} title={post.title} />

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-end dowgap-14">
          <div className="w-full lg:w-157.5 shrink-0 flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-4 py-1 bg-white rounded-2xl outline-1 -outline-offset-1 outline-stone-300 text-stone-500 text-xs font-semibold font-montserrat uppercase leading-5">
                  {post.product}
                </span>
                <span className="px-4 py-1 bg-white rounded-2xl outline-1 -outline-offset-1 outline-stone-300 text-stone-500 text-xs font-semibold font-montserrat uppercase leading-5">
                  {post.industry}
                </span>
              </div>
              <h1 className="text-stone-900 text-3xl font-medium font-montserrat leading-10">{post.title}</h1>
              <div className="h-px bg-stone-300" />
              <span className="text-neutral-400 text-sm font-semibold font-montserrat uppercase leading-5">
                {post.date}
              </span>
            </div>

            {/* Featured image */}
            <div className="relative w-full h-96 rounded-2xl overflow-hidden">
              <Image src={post.image} alt={post.title} fill className="object-cover" />
            </div>

            {/* Body */}
            <div className="flex flex-col gap-10">
              <p className="text-stone-500 text-base font-medium font-montserrat leading-6 whitespace-pre-line">
                {detail.intro}
              </p>

              {detail.sections.map((section) => (
                <div key={section.heading} className="flex flex-col gap-5">
                  <h2 id={section.heading} className="text-zinc-800 text-2xl font-medium font-montserrat leading-8">
                    {section.heading}
                  </h2>
                  <p className="text-stone-500 text-base font-medium font-montserrat leading-6">
                    {section.description}
                  </p>
                  {section.image && (
                    <div className="relative w-full h-80 bg-white rounded-2xl outline-1 -outline-offset-1 outline-neutral-200 overflow-hidden">
                      <Image src={section.image} alt={section.heading} fill className="object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-5 lg:sticky lg:top-28">
            <h3 className="text-red-600 text-base font-semibold font-montserrat leading-6">In this {typeSingular}</h3>

            <div className="flex flex-col gap-2">
              {detail.sections.map((section, i) => (
                <a
                  key={section.heading}
                  href={`#${section.heading}`}
                  className={
                    i === 0
                      ? "text-stone-900 text-sm font-semibold font-montserrat leading-5 hover:text-red-600 transition-colors"
                      : "text-stone-500 text-sm font-medium font-montserrat leading-5 hover:text-red-600 transition-colors"
                  }
                >
                  {section.heading}
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-zinc-800 text-sm font-medium font-montserrat leading-5">Tags:</span>
              <div className="flex items-start gap-1.5 flex-wrap">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1 bg-white rounded-2xl outline-1 -outline-offset-1 outline-stone-300 text-stone-500 text-xs font-semibold font-montserrat uppercase leading-5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-5 pt-2">
              <div className="h-px bg-stone-300" />
              <div className="flex justify-between items-center">
                <span className="text-zinc-800 text-sm font-medium font-montserrat leading-5">Share:</span>
                <div className="flex items-center gap-3.5">
                  <FaFacebookF className="size-4 text-zinc-800" />
                  <FaXTwitter className="size-4 text-zinc-800" />
                  <FaLinkedinIn className="size-4 text-zinc-800" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
