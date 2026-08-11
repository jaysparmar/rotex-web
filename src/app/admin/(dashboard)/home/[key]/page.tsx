import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { HeroForm } from "@/components/admin/home-sections/hero-form";
import { PartnersPickerForm } from "@/components/admin/home-sections/partners-picker-form";
import { CertificationsPickerForm } from "@/components/admin/home-sections/certifications-picker-form";
import { RedefiningForm } from "@/components/admin/home-sections/redefining-form";
import { IndustriesForm } from "@/components/admin/home-sections/industries-form";
import { ProductsForm } from "@/components/admin/home-sections/products-form";
import { CustomerStoriesPickerForm } from "@/components/admin/home-sections/customer-stories-picker-form";
import { ResourcesPickerForm } from "@/components/admin/home-sections/resources-picker-form";
import { CtaForm } from "@/components/admin/home-sections/cta-form";

export default async function AdminHomeSectionPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const section = await prisma.homeSection.findUnique({ where: { key } });

  if (!section) notFound();

  const meta = { initialEnabled: section.enabled };
  const data = section.data as never;

  const label = key.replace("-", " ");

  const allPartners =
    key === "partners"
      ? await prisma.partner.findMany({
          where: { published: true },
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, logo: true },
        })
      : [];

  const allCertifications =
    key === "certifications"
      ? await prisma.certification.findMany({
          where: { published: true },
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, logo: true },
        })
      : [];

  const allStories =
    key === "customer-stories"
      ? await prisma.customerStory.findMany({
          where: { published: true },
          orderBy: { createdAt: "asc" },
          select: { id: true, quote: true, author: true, company: true, image: true },
        })
      : [];

  const allResources =
    key === "resources"
      ? await prisma.resource.findMany({
          where: { published: true },
          orderBy: { createdAt: "asc" },
          select: { id: true, type: true, title: true, slug: true, image: true },
        })
      : [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold capitalize">{label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edit this home page section.</p>
        </div>
        <Breadcrumb items={[{ label: "Home Page", href: "/admin/home" }, { label }]} />
      </div>

      {key === "hero" && <HeroForm {...meta} initialData={data} />}
      {key === "partners" && (
        <PartnersPickerForm {...meta} initialData={data} allPartners={allPartners} />
      )}
      {key === "certifications" && (
        <CertificationsPickerForm {...meta} initialData={data} allCertifications={allCertifications} />
      )}
      {key === "redefining" && <RedefiningForm {...meta} initialData={data} />}
      {key === "industries" && <IndustriesForm {...meta} initialData={data} />}
      {key === "products" && <ProductsForm {...meta} initialData={data} />}
      {key === "customer-stories" && (
        <CustomerStoriesPickerForm {...meta} initialData={data} allStories={allStories} />
      )}
      {key === "resources" && (
        <ResourcesPickerForm {...meta} initialData={data} allResources={allResources} />
      )}
      {key === "cta" && <CtaForm {...meta} initialData={data} />}
    </div>
  );
}
