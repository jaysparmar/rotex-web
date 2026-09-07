import type { Industry, SubIndustry } from "@/generated/prisma/client";
import type { StaticImageData } from "next/image";
import { prisma } from "@/lib/prisma";
import { getSelectedPartners } from "@/lib/partners";
import { getSelectedCustomerStories } from "@/lib/customer-stories";
import { IndustryHero } from "@/components/sections/industry-hero";
import { TrustedLeaders } from "@/components/sections/trusted-leaders";
import { IndustryChallengesSolutions } from "@/components/sections/industry-challenges-solutions";
import { IndustryProductsSwiper } from "@/components/sections/industry-products-swiper";
import { IndustryCustomerStories } from "@/components/sections/industry-customer-stories";

import oilBg        from "@/assets/Images/breadcurmbBackgrounds/oil_bg.jpg";
import powerBg      from "@/assets/Images/breadcurmbBackgrounds/power_bg.png";
import automativeBg from "@/assets/Images/breadcurmbBackgrounds/automative_bg.png";
import railBg       from "@/assets/Images/breadcurmbBackgrounds/rail_bg.jpg";
import aerospaceBg  from "@/assets/Images/breadcurmbBackgrounds/aerospace_bg.jpg";
import machineBg    from "@/assets/Images/breadcurmbBackgrounds/machine_bg.jpg";
import defaultBg    from "@/assets/Images/breadcurmbBackgrounds/default_bg.jpg";

const BG_MAP: Record<string, StaticImageData> = {
  oil:        oilBg,
  power:      powerBg,
  automative: automativeBg,
  rail:       railBg,
  aerospace:  aerospaceBg,
  machine:    machineBg,
  process:    defaultBg,
};

/*
  The body of a sub-sector — rendered both at /industries/[sector]/[sub] and,
  for the first sub-sector, at /industries/[sector] itself.
*/
export async function SubIndustryContent({
  industry,
  subIndustry,
}: {
  industry: Industry;
  subIndustry: SubIndustry;
}) {
  const bg = subIndustry.image ?? (industry.bgKey ? BG_MAP[industry.bgKey] : undefined);

  const partners = await getSelectedPartners(subIndustry.partnerIds as unknown as string[]);
  const logos = partners.map((p) => ({ id: p.id, src: p.logo, alt: p.name }));

  const stories = await getSelectedCustomerStories(subIndustry.storyIds as unknown as string[]);

  const recommendedCategoryIds = (subIndustry.recommendedProducts as unknown as string[]) ?? [];
  const recommendedCategories = recommendedCategoryIds.length
    ? await prisma.category.findMany({
        where: { id: { in: recommendedCategoryIds }, products: { some: {} } },
        select: { id: true, name: true, slug: true, image: true },
      })
    : [];
  const categoryById = new Map(recommendedCategories.map((c) => [c.id, c]));
  const recommendedProducts = recommendedCategoryIds
    .map((id) => categoryById.get(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => ({ name: c.name, image: c.image ?? "", href: `/products?category=${c.slug}` }));

  return (
    <>
      {bg && (
        <IndustryHero
          name={subIndustry.name}
          description={subIndustry.description}
          bg={bg}
          mobileBg={subIndustry.mobileImage ?? undefined}
        />
      )}

      {logos.length > 0 && <TrustedLeaders title="Trusted by Industry leaders" logos={logos} />}

      <IndustryChallengesSolutions
        challengesTitle={subIndustry.challengesTitle}
        challenges={subIndustry.challenges as unknown as { title: string; description: string }[]}
        solutionsTitle={subIndustry.solutionsTitle}
        solutions={subIndustry.solutions as unknown as { title: string; description: string }[]}
      />

      <div id="recommended-products">
        <IndustryProductsSwiper products={recommendedProducts} />
      </div>

      <IndustryCustomerStories stories={stories} />
    </>
  );
}
