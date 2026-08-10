import { CareerHeroSection } from "@/components/sections/career-hero-section";
import { CareerValuesSection } from "@/components/sections/career-values-section";
import { CareerGallerySection } from "@/components/sections/career-gallery-section";
import { CareerWhySection } from "@/components/sections/career-why-section";
import { CareerOpenPositionsSection } from "@/components/sections/career-open-positions-section";
import { CareerFormSection } from "@/components/sections/career-form-section";
import { fetchCareerSection } from "@/lib/site-api";
import { prisma } from "@/lib/prisma";

type CtaButton = { label: string; href: string };
type HeroData = { title: string; description: string; cta: CtaButton };
type ValuesData = { heading: string; description: string; values: { icon: string; title: string; description: string }[] };
type GalleryData = { images: { src: string; alt: string; size: "wide" | "narrow" }[] };
type WhyData = { heading: string; description: string; cards: { title: string; description: string; image?: string }[] };
type PositionsData = { heading: string };
type FormData = { heading: string; description: string; benefits: string[]; experienceOptions: string[] };

export default async function CareerPage() {
  const [hero, values, gallery, why, positions, form, jobRecords] = await Promise.all([
    fetchCareerSection<HeroData>("hero"),
    fetchCareerSection<ValuesData>("values"),
    fetchCareerSection<GalleryData>("gallery"),
    fetchCareerSection<WhyData>("why"),
    fetchCareerSection<PositionsData>("positions"),
    fetchCareerSection<FormData>("form"),
    prisma.jobPosting.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const positionOptions = Array.from(new Set(jobRecords.map((j) => j.title)));
  const locationOptions = Array.from(new Set(jobRecords.map((j) => j.location)));

  return (
    <div>
      {hero?.enabled && (
        <CareerHeroSection title={hero.title} description={hero.description} cta={hero.cta} />
      )}

      {values?.enabled && (
        <CareerValuesSection heading={values.heading} description={values.description} values={values.values} />
      )}

      {gallery?.enabled && gallery.images.length > 0 && <CareerGallerySection images={gallery.images} />}

      {why?.enabled && (
        <CareerWhySection heading={why.heading} description={why.description} cards={why.cards} />
      )}

      {positions?.enabled && (
        <CareerOpenPositionsSection
          heading={positions.heading}
          jobs={jobRecords.map((j) => ({
            id: j.id,
            company: j.company,
            title: j.title,
            category: j.category,
            location: j.location,
            tag: j.tag,
          }))}
        />
      )}

      {form?.enabled && (
        <CareerFormSection
          heading={form.heading}
          description={form.description}
          benefits={form.benefits}
          experienceOptions={form.experienceOptions}
          positionOptions={positionOptions}
          locationOptions={locationOptions}
        />
      )}
    </div>
  );
}
