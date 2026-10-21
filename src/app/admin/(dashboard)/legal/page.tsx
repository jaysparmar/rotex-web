import { prisma } from "@/lib/prisma";
import { LegalPageList } from "@/components/admin/legal/legal-page-list";

export default async function AdminLegalPage() {
  const pages = await prisma.legalPage.findMany({ orderBy: { key: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Legal Pages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Privacy Policy, Terms & Conditions, Cookie Policy, and any other legal page shown on the public site.
        </p>
      </div>

      <LegalPageList
        pages={pages.map((p) => ({ key: p.key, title: p.title, updatedAt: p.updatedAt.toISOString() }))}
      />
    </div>
  );
}
