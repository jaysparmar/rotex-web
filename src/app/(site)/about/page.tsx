import { PillButton } from "@/components/ui/pill-button";
import { fetchAboutSection } from "@/lib/site-api";
import { AboutHeroSection } from "@/components/sections/about-hero-section";
import { AboutStorySection } from "@/components/sections/about-story-section";
import { MissionVisionSection } from "@/components/sections/mission-vision-section";
import { AboutValuesSection } from "@/components/sections/about-values-section";
import { JourneyTimelineSection } from "@/components/sections/journey-timeline-section";
import { TrustedCountriesBanner } from "@/components/sections/trusted-countries-banner";
import { ZeroDowntimeCtaSection } from "@/components/sections/zero-downtime-cta-section";
import { GrowWithRotexSection } from "@/components/sections/grow-with-rotex-section";
import { AchievementsSection } from "@/components/sections/achievements-section";
import { GallerySwiperSection } from "@/components/sections/gallery-swiper-section";
import { LearnSection } from "@/components/sections/learn-section";

type CtaButton = { label: string; href: string };
type HeroData = { breadcrumbLabel: string; title: string; description: string; cta: CtaButton };
type StoryData = {
  heading: string;
  paragraphs: string[];
  stats: { value: string; label: string }[];
  trustedLabel: string;
  logos: { id: string; src: string; alt: string }[];
  videoSrc: string;
};
type MissionVisionData = { mission: string; vision: string };
type ValuesData = { heading: string; subheading: string; values: { title: string; description: string }[] };
type JourneyData = { heading: string; milestones: { year: string; title: string; description: string }[] };
type TrustedCountriesData = { title: string; description: string };
type ZeroDowntimeCtaData = { title: string; description: string; ctaPrimary: CtaButton; ctaSecondary: CtaButton };
type GrowWithRotexData = { title: string; description: string; image: string; cta: CtaButton };
type AchievementsData = {
  heading: string;
  achievements: { badge: "rail" | "zed" | "trophy"; text: string }[];
  cta: CtaButton;
};
type GalleryData = { images: { src: string; alt: string }[] };
type ResourcesData = {
  heading: { title: string };
  tabs: { id: string; label: string; cta: CtaButton; resources: { slug: string; title: string; image: string }[] }[];
};

export default async function AboutPage() {
  const hero = await fetchAboutSection<HeroData>("hero");
  const story = await fetchAboutSection<StoryData>("story");
  const missionVision = await fetchAboutSection<MissionVisionData>("mission-vision");
  const values = await fetchAboutSection<ValuesData>("values");
  const journey = await fetchAboutSection<JourneyData>("journey");
  const trustedCountries = await fetchAboutSection<TrustedCountriesData>("trusted-countries");
  const zeroDowntimeCta = await fetchAboutSection<ZeroDowntimeCtaData>("zero-downtime-cta");
  const growWithRotex = await fetchAboutSection<GrowWithRotexData>("grow-with-rotex");
  const achievements = await fetchAboutSection<AchievementsData>("achievements");
  const gallery = await fetchAboutSection<GalleryData>("gallery");
  const resources = await fetchAboutSection<ResourcesData>("resources");
  const resourceTabs = resources?.tabs.filter((t) => t.resources.length > 0) ?? [];

  return (
    <>
      {hero?.enabled && (
        <AboutHeroSection title={hero.title} description={hero.description} breadcrumbLabel={hero.breadcrumbLabel}>
          <PillButton
            href={hero.cta.href}
            tone="lightOrange"
            size="md"
            className="w-full lg:w-auto h-12 lg:h-auto font-bold shadow-[0px_13px_7.8px_-12px_rgba(0,0,0,0.25)]"
          >
            {hero.cta.label}
          </PillButton>
        </AboutHeroSection>
      )}

      {story?.enabled && (
        <AboutStorySection
          heading={story.heading}
          paragraphs={story.paragraphs}
          stats={story.stats}
          trustedLabel={story.trustedLabel}
          logos={story.logos}
          videoSrc={story.videoSrc}
        />
      )}

      {missionVision?.enabled && (
        <MissionVisionSection mission={missionVision.mission} vision={missionVision.vision} />
      )}

      {values?.enabled && (
        <AboutValuesSection heading={values.heading} subheading={values.subheading} values={values.values} />
      )}

      {journey?.enabled && (
        <JourneyTimelineSection heading={journey.heading} milestones={journey.milestones} />
      )}

      {trustedCountries?.enabled && (
        <TrustedCountriesBanner title={trustedCountries.title} description={trustedCountries.description} />
      )}

      {zeroDowntimeCta?.enabled && (
        <ZeroDowntimeCtaSection
          title={zeroDowntimeCta.title}
          description={zeroDowntimeCta.description}
          ctaPrimary={zeroDowntimeCta.ctaPrimary}
          ctaSecondary={zeroDowntimeCta.ctaSecondary}
        />
      )}

      {growWithRotex?.enabled && (
        <GrowWithRotexSection
          title={growWithRotex.title}
          description={growWithRotex.description}
          image={growWithRotex.image || undefined}
          cta={growWithRotex.cta}
        />
      )}

      {achievements?.enabled && (
        <AchievementsSection
          heading={achievements.heading}
          achievements={achievements.achievements}
          cta={achievements.cta}
        />
      )}

      {gallery?.enabled && gallery.images.length > 0 && <GallerySwiperSection images={gallery.images} />}

      {resources?.enabled && resourceTabs.length > 0 && (
        <LearnSection heading={resources.heading.title} tabs={resourceTabs} />
      )}
    </>
  );
}
