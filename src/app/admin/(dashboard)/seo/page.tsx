import Link from "next/link";
import { ArrowUpRight, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { SeoCollectionSelect } from "@/components/admin/seo/seo-collection-select";
import { SeoCollectionTable } from "@/components/admin/seo/seo-collection-table";
import { SEO_PAGES, type SeoMetaData } from "@/lib/seo";
import { SEO_COLLECTIONS, listSeoCollectionItems, type SeoCollectionId } from "@/lib/seo-collections";

const COLLECTION_IDS = SEO_COLLECTIONS.map((c) => c.id);

function isCollectionId(value: string): value is SeoCollectionId {
  return (COLLECTION_IDS as string[]).includes(value);
}

export default async function AdminSeoPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string }>;
}) {
  const { collection: rawCollection } = await searchParams;
  const collection = rawCollection && isCollectionId(rawCollection) ? rawCollection : null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">SEO Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Meta title, description, keywords, and structured data for every public page.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "SEO Settings" }]} />
      </div>

      <div className="flex items-center gap-2.5">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Viewing</span>
        <SeoCollectionSelect value={collection ?? "static"} />
      </div>

      {collection ? <CollectionTable collection={collection} /> : <StaticPageGrid />}
    </div>
  );
}

async function StaticPageGrid() {
  const rows = await prisma.seoPage.findMany();
  const byKey = new Map(rows.map((r) => [r.key, r.data as SeoMetaData]));

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SEO_PAGES.map((page) => {
        const data = byKey.get(page.key);
        const configured = Boolean(data?.title?.trim());
        return (
          <Card key={page.key} className="flex flex-col justify-between">
            <CardContent className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{page.label}</p>
                  <Link
                    href={page.path}
                    target="_blank"
                    className="mt-0.5 inline-flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {page.path}
                    <ArrowUpRight className="h-3 w-3 shrink-0" />
                  </Link>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    configured ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {configured ? "Configured" : "Not set"}
                </span>
              </div>

              {data?.title?.trim() ? (
                <p className="line-clamp-2 text-xs text-muted-foreground">{data.title}</p>
              ) : (
                <p className="text-xs italic text-muted-foreground">No meta title set yet.</p>
              )}

              <Button
                variant={configured ? "outline" : "default"}
                size="sm"
                className="mt-auto w-full"
                nativeButton={false}
                render={<Link href={`/admin/seo/${page.key}`} />}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                {configured ? "Edit SEO" : "Configure SEO"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

async function CollectionTable({ collection }: { collection: SeoCollectionId }) {
  const items = await listSeoCollectionItems(collection);
  const label = SEO_COLLECTIONS.find((c) => c.id === collection)?.label ?? collection;
  const itemNoun = label.replace(/s$/, "");

  const seoRows =
    items.length > 0 ? await prisma.seoPage.findMany({ where: { key: { in: items.map((i) => i.key) } } }) : [];
  const byKey = new Map(seoRows.map((r) => [r.key, r.data as SeoMetaData]));

  const rows = items.map((item) => ({ ...item, configured: Boolean(byKey.get(item.key)?.title?.trim()) }));

  return (
    <Card>
      <CardContent className="p-4">
        <SeoCollectionTable collectionLabel={label} itemNoun={itemNoun} rows={rows} />
      </CardContent>
    </Card>
  );
}
