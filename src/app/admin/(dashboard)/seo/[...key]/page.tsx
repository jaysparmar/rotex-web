import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { SeoForm } from "@/components/admin/seo/seo-form";
import { getPageSeo } from "@/lib/seo";
import { resolveSeoTarget } from "@/lib/seo-collections";

export default async function AdminSeoEditPage({ params }: { params: Promise<{ key: string[] }> }) {
  const { key: keyParts } = await params;
  const key = keyParts.join("/");
  const target = await resolveSeoTarget(key);
  if (!target) notFound();

  const data = await getPageSeo(key);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{target.label}</h1>
          <Link
            href={target.path}
            target="_blank"
            className="mt-0.5 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            {target.path}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "SEO Settings", href: "/admin/seo" },
            { label: target.label },
          ]}
        />
      </div>

      <SeoForm pageKey={key} initialData={data} />
    </div>
  );
}
