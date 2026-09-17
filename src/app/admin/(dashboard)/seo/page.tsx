import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { SEO_PAGES, type SeoMetaData } from "@/lib/seo";

export default async function AdminSeoPage() {
  const rows = await prisma.seoPage.findMany();
  const byKey = new Map(rows.map((r) => [r.key, r.data as SeoMetaData]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">SEO Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Meta title, description, keywords, and structured data for every public page.
        </p>
      </div>

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {SEO_PAGES.map((page) => {
            const data = byKey.get(page.key);
            const configured = Boolean(data?.title?.trim());
            return (
              <Link
                key={page.key}
                href={`/admin/seo/${page.key}`}
                className="flex items-center justify-between gap-4 p-4 hover:bg-accent"
              >
                <div>
                  <p className="text-sm font-medium">{page.label}</p>
                  <p className="text-xs text-muted-foreground">{page.path}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    configured ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {configured ? "Configured" : "Not set"}
                </span>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
