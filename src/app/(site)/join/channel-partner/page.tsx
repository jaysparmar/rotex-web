import { ChannelPartnerHeroSection } from "@/components/sections/channel-partner-hero-section";
import { ChannelPartnerStatsSection } from "@/components/sections/channel-partner-stats-section";
import { ChannelPartnerWhySection } from "@/components/sections/channel-partner-why-section";
import { ChannelPartnerBenefitsSection } from "@/components/sections/channel-partner-benefits-section";
import { ChannelPartnerMapSection } from "@/components/sections/channel-partner-map-section";
import { CustomerStoriesSection } from "@/components/sections/customer-stories-section";
import { ChannelPartnerFormSection } from "@/components/sections/channel-partner-form-section";

const channelPartnerStories = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=640&q=80",
    quote:
      "Becoming a Rotex channel partner gave us access to a proven, technically differentiated product line — our margins and customer retention both improved within the first year.",
    author: "Ahmed Al-Farsi",
    company: "Managing Director, Gulf Flow Automation LLC",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=640&q=80",
    quote:
      "The support from Rotex's technical and sales teams made it easy to expand into new industrial segments we hadn't served before.",
    author: "Priya Nair",
    company: "CEO, Nair Industrial Solutions",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=640&q=80",
    quote:
      "Rotex's engineering-first approach to product design has made it far easier for us to win technically demanding tenders in the oil & gas sector.",
    author: "Marco Bianchi",
    company: "Founder, Bianchi Flow Systems Srl",
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=640&q=80",
    quote:
      "From onboarding to ongoing technical training, Rotex treated us as a true growth partner, not just a supplier.",
    author: "Wei Zhang",
    company: "General Manager, Zhang Industrial Trading Co.",
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654944?w=640&q=80",
    quote:
      "The scalable margin structure and consistent inventory support helped us grow our solenoid valve business by over 40% in two years.",
    author: "Fatima Al-Sayed",
    company: "Sales Director, Al-Sayed Automation Group",
  },
];

export default function ChannelPartnerPage() {
  return (
    <div>
      <ChannelPartnerHeroSection />
      <ChannelPartnerStatsSection />
      <ChannelPartnerWhySection />
      <ChannelPartnerBenefitsSection />
      <ChannelPartnerMapSection />
      <CustomerStoriesSection
        heading={{ title: "Channel Partner Stories", subtitle: "Hear from partners who grew with Rotex" }}
        stories={channelPartnerStories}
      />
      <ChannelPartnerFormSection />
    </div>
  );
}
