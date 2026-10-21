import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { LegalPageForm } from "@/components/admin/legal/legal-page-form";

export default async function AdminLegalPageEdit({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;

  const page = await prisma.legalPage.findUnique({ where: { key } });
  if (!page) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{page.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edit this legal page.</p>
        </div>
        <Breadcrumb items={[{ label: "Legal Pages", href: "/admin/legal" }, { label: page.title }]} />
      </div>

      <LegalPageForm pageKey={key} initialTitle={page.title} initialContent={page.content} />
    </div>
  );
}
