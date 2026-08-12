import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";

const PAGES = [
  { key: "privacy", label: "Privacy Policy" },
  { key: "terms", label: "Terms & Conditions" },
];

export default async function AdminLegalPage() {
  const rows = await prisma.legalPage.findMany();
  const byKey = new Map(rows.map((r) => [r.key, r]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Legal Pages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit the Privacy Policy and Terms & Conditions shown on the public site.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PAGES.map((p) => {
          const row = byKey.get(p.key);
          return (
            <Link key={p.key} href={`/admin/legal/${p.key}`}>
              <Card className="transition-colors hover:border-primary">
                <CardContent className="p-4">
                  <p className="font-medium">{row?.title ?? p.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Last updated {row ? new Date(row.updatedAt).toLocaleDateString() : "never"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
