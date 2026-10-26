import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { SeoPagesExplorer, type SeoItem } from "@/components/admin/seo/seo-pages-explorer";
import { SEO_PAGES, type SeoMetaData } from "@/lib/seo";
import { SEO_COLLECTIONS, listSeoCollectionItems } from "@/lib/seo-collections";

export default async function AdminSeoPage() {
  const [seoRows, ...collectionItems] = await Promise.all([
    prisma.seoPage.findMany(),
    ...SEO_COLLECTIONS.map((c) => listSeoCollectionItems(c.id)),
  ]);
  const byKey = new Map(seoRows.map((r) => [r.key, r.data as SeoMetaData]));

  const staticItems: SeoItem[] = SEO_PAGES.map((p) => ({
    key: p.key,
    label: p.label,
    path: p.path,
    group: "static",
    groupLabel: "Static Pages",
    configured: Boolean(byKey.get(p.key)?.title?.trim()),
    metaTitle: byKey.get(p.key)?.title,
  }));

  const dynamicItems: SeoItem[] = SEO_COLLECTIONS.flatMap((c, i) =>
    collectionItems[i].map((item) => ({
      key: item.key,
      label: item.label,
      sub: item.sub,
      path: item.path,
      group: c.id,
      groupLabel: c.label,
      configured: Boolean(byKey.get(item.key)?.title?.trim()),
      metaTitle: byKey.get(item.key)?.title,
    }))
  );

  const items = [...staticItems, ...dynamicItems];
  const groups = [{ id: "static", label: "Static Pages" }, ...SEO_COLLECTIONS];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">SEO Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage search appearance across your website.</p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "SEO Settings" }]} />
      </div>

      <SeoPagesExplorer items={items} groups={groups} />
    </div>
  );
}
