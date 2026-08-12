import DOMPurify from "isomorphic-dompurify";
import { PageHero } from "@/components/ui/page-hero";
import styles from "./rich-content.module.css";

export function LegalPageSection({ title, content }: { title: string; content: string }) {
  const contentHtml = DOMPurify.sanitize(content, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "target"],
  });

  return (
    <>
      <PageHero title={title} />
      <section className="py-16">
        <div className="container">
          <div className={styles.content} dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </section>
    </>
  );
}
