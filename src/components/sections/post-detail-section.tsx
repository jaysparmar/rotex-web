import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { FaFacebookF, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";
import { PostBreadcrumb } from "@/components/ui/post-breadcrumb";
import { getResourceTags, formatResourceDate, type ResourceItem } from "@/lib/resource-types";
import { extractToc, slugifyHeading } from "@/lib/markdown-toc";

type PostDetailSectionProps = {
  post: ResourceItem;
  typeLabel: string;
  typeSingular: string;
  typeHref: string;
};

function headingText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(headingText).join("");
  return "";
}

const markdownComponents: Components = {
  h2: ({ children, ...props }) => (
    <h2
      id={slugifyHeading(headingText(children))}
      className="scroll-mt-24 lg:scroll-mt-32 text-zinc-800 text-2xl font-medium font-montserrat leading-8"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-zinc-800 text-xl font-medium font-montserrat leading-7" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="text-stone-500 text-base font-medium font-montserrat leading-6" {...props}>
      {children}
    </p>
  ),
  a: ({ children, ...props }) => (
    <a className="text-red-600 underline hover:no-underline" {...props}>
      {children}
    </a>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc pl-5 flex flex-col gap-1.5 text-stone-500 text-base font-medium font-montserrat leading-6" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal pl-5 flex flex-col gap-1.5 text-stone-500 text-base font-medium font-montserrat leading-6" {...props}>
      {children}
    </ol>
  ),
  img: ({ ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} className="w-full rounded-2xl outline-1 -outline-offset-1 outline-neutral-200" alt={props.alt ?? ""} />
  ),
  strong: ({ children, ...props }) => (
    <strong className="text-stone-900 font-semibold" {...props}>
      {children}
    </strong>
  ),
};

export function PostDetailSection({ post, typeLabel, typeSingular, typeHref }: PostDetailSectionProps) {
  const tags = getResourceTags(post);
  const toc = extractToc(post.content);

  return (
    <section className="pt-28 pb-16 lg:pt-32">
      <div className="container flex flex-col gap-10">
        <PostBreadcrumb typeLabel={typeLabel} typeHref={typeHref} title={post.title} />

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-end gap-10 lg:gap-20">
          <div className="w-full lg:w-157.5 shrink-0 flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-1.5 flex-wrap">
                {post.product && (
                  <span className="px-4 py-1 bg-white rounded-2xl outline-1 -outline-offset-1 outline-stone-300 text-stone-500 text-xs font-semibold font-montserrat uppercase leading-5">
                    {post.product}
                  </span>
                )}
                {post.industry && (
                  <span className="px-4 py-1 bg-white rounded-2xl outline-1 -outline-offset-1 outline-stone-300 text-stone-500 text-xs font-semibold font-montserrat uppercase leading-5">
                    {post.industry}
                  </span>
                )}
              </div>
              <h1 className="text-stone-900 text-3xl font-medium font-montserrat leading-10">{post.title}</h1>
              <div className="h-px bg-stone-300" />
              <span className="text-neutral-400 text-sm font-semibold font-montserrat uppercase leading-5">
                {formatResourceDate(post.createdAt)}
              </span>
            </div>

            {/* Featured image */}
            <div className="relative w-full h-96 rounded-2xl overflow-hidden">
              <Image src={post.image} alt={post.title} fill className="object-cover" unoptimized />
            </div>

            {/* Body */}
            <div className="flex flex-col gap-6 [&>*+*]:mt-0">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {post.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-5 lg:sticky lg:top-28">
            {toc.length > 0 && (
              <>
                <h3 className="text-red-600 text-base font-semibold font-montserrat leading-6">In this {typeSingular}</h3>
                <div className="flex flex-col gap-2">
                  {toc.map((entry, i) => (
                    <a
                      key={entry.id}
                      href={`#${entry.id}`}
                      className={
                        i === 0
                          ? "text-stone-900 text-sm font-semibold font-montserrat leading-5 hover:text-red-600 transition-colors"
                          : "text-stone-500 text-sm font-medium font-montserrat leading-5 hover:text-red-600 transition-colors"
                      }
                    >
                      {entry.text}
                    </a>
                  ))}
                </div>
              </>
            )}

            {tags.length > 0 && (
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
            )}

            <div className="flex flex-col gap-5 pt-2">
              <div className="h-px bg-stone-300" />
              <div className="flex justify-between items-center">
                <span className="text-zinc-800 text-sm font-medium font-montserrat leading-5">Share:</span>
                <div className="flex items-center gap-3.5">
                  <FaLinkedinIn className="size-4 text-zinc-800" />
                  <FaXTwitter className="size-4 text-zinc-800" />
                  <FaFacebookF className="size-4 text-zinc-800" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
