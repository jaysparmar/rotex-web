import { PillButton } from "@/components/ui/pill-button";
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

/*
  Static for now — the About page deliberately does not read the home page's CMS
  Resources section, so it stays a static render. Swap in fetchHomeSection when
  this should follow the CMS.
*/
const RESOURCE_TABS = [
  {
    id: "case-studies",
    label: "Case Studies",
    cta: { label: "Read All Case Studies", href: "/case-studies" },
    resources: [
      {
        slug: "solenoid-valve-classification",
        title: "Solenoid Valve Classification: The Engineering Logic Behind Reliable Automation Systems",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
      },
      {
        slug: "future-industrial-valves",
        title: "Future of Industrial Valves: 7 Rotex Technologies Improving Reliability & Uptime",
        image: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=600&q=80",
      },
      {
        slug: "select-solenoid-valve",
        title: "How to Select the Right Solenoid Valve for Your Industrial Process?",
        image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=600&q=80",
      },
    ],
  },
  {
    id: "news",
    label: "News & Updates",
    cta: { label: "View All News & Updates", href: "/news-updates" },
    resources: [
      {
        slug: "global-expansion",
        title: "Rotex Expands Global Distribution Network Across 15 New Markets",
        image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80",
      },
      {
        slug: "smart-valve-controllers",
        title: "Rotex Launches Next-Generation Smart Valve Controllers for Industry 4.0",
        image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&q=80",
      },
      {
        slug: "sil3-certification",
        title: "Rotex Achieves SIL 3 Certification for Critical Safety Systems",
        image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80",
      },
    ],
  },
  {
    id: "blogs",
    label: "Blogs",
    cta: { label: "Read All Blogs", href: "/blogs" },
    resources: [
      {
        slug: "valve-maintenance-signs",
        title: "5 Signs Your Industrial Valve Needs Immediate Maintenance",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80",
      },
      {
        slug: "valve-actuators-guide",
        title: "Understanding Valve Actuators: A Comprehensive Guide for Engineers",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
      },
      {
        slug: "flow-control-oil-gas",
        title: "Flow Control in the Oil & Gas Industry: Challenges and Solutions",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
      },
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      <AboutHeroSection
        title="Empowering Industries. Where It Matters Most."
        description="Engineered flow control solutions designed to perform where operational failure is not an option - across Oil & Gas, Chemical, Power, Pharma, Automotive, and global process industries."
      >
        <PillButton
          href="/contact"
          tone="lightOrange"
          size="md"
          className="w-full lg:w-auto h-12 lg:h-auto font-bold shadow-[0px_13px_7.8px_-12px_rgba(0,0,0,0.25)]"
        >
          Talk to Expert
        </PillButton>
      </AboutHeroSection>

      <AboutStorySection />

      <MissionVisionSection />

      <AboutValuesSection />

      <JourneyTimelineSection />

      <TrustedCountriesBanner />

      <ZeroDowntimeCtaSection />

      <GrowWithRotexSection />

      <AchievementsSection />

      <GallerySwiperSection />

      <LearnSection heading="Resources" tabs={RESOURCE_TABS} />
    </>
  );
}
