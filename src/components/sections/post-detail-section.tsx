import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import { PostBreadcrumb } from "@/components/ui/post-breadcrumb";
import { PostShareButtons } from "@/components/ui/post-share-buttons";
import { getResourceTags, formatResourceDate, type ResourceItem } from "@/lib/resource-types";
import { extractToc, slugifyHeading } from "@/lib/markdown-toc";
import styles from "./post-detail-section.module.css";

type PostDetailSectionProps = {
  post: ResourceItem;
  typeLabel: string;
  typeSingular: string;
  typeHref: string;
};

function withHeadingIds(html: string): string {
  return html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (match, attrs: string, inner: string) => {
    if (/\sid=/.test(attrs)) return match;
    const text = inner.replace(/<[^>]+>/g, "").trim();
    return `<h2${attrs} id="${slugifyHeading(text)}">${inner}</h2>`;
  });
}

export function PostDetailSection({ post, typeLabel, typeSingular, typeHref }: PostDetailSectionProps) {
  const tags = getResourceTags(post);
  const toc = extractToc(post.content);
  const contentHtml = DOMPurify.sanitize(withHeadingIds(post.content), {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "target"],
  });

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
            <div className={styles.content} dangerouslySetInnerHTML={{ __html: contentHtml }} />
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
                <PostShareButtons title={post.title} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
