import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { SeoForm } from "@/components/admin/seo/seo-form";
import { SEO_PAGES, getPageSeo } from "@/lib/seo";

export default async function AdminSeoEditPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const page = SEO_PAGES.find((p) => p.key === key);
  if (!page) notFound();

  const data = await getPageSeo(key);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{page.label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{page.path}</p>
        </div>
        <Breadcrumb items={[{ label: "SEO Settings", href: "/admin/seo" }, { label: page.label }]} />
      </div>

      <SeoForm pageKey={key} initialData={data} />
    </div>
  );
}
