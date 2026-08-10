import { notFound } from "next/navigation";
import { fetchAboutSection } from "@/lib/site-api";
import { getPublishedAwards } from "@/lib/awards";
import { AwardsHeroSection } from "@/components/sections/awards-hero-section";
import { AwardsGrid } from "@/components/sections/awards-grid";

type AwardsHeroData = { title: string; description: string };

export default async function AwardsPage() {
  const hero = await fetchAboutSection<AwardsHeroData>("awards");
  if (!hero?.enabled) notFound();

  const awards = await getPublishedAwards();

  return (
    <div>
      <AwardsHeroSection title={hero.title} description={hero.description} />

      {/* Breadcrumb lives inside AwardsHeroSection */}
      <AwardsGrid
        awards={awards.map((a) => ({
          slug: a.slug,
          url: a.url,
          year: a.year,
          title: a.title,
          description: a.description,
          image: a.image,
        }))}
      />
    </div>
  );
}
