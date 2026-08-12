import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { LegalPageForm } from "@/components/admin/legal/legal-page-form";

const VALID_KEYS = new Set(["privacy", "terms"]);
const LABELS: Record<string, string> = { privacy: "Privacy Policy", terms: "Terms & Conditions" };

export default async function AdminLegalPageEdit({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  if (!VALID_KEYS.has(key)) notFound();

  const page = await prisma.legalPage.findUnique({ where: { key } });
  const label = LABELS[key];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edit this legal page.</p>
        </div>
        <Breadcrumb items={[{ label: "Legal Pages", href: "/admin/legal" }, { label }]} />
      </div>

      <LegalPageForm pageKey={key} initialTitle={page?.title ?? label} initialContent={page?.content ?? ""} />
    </div>
  );
}
