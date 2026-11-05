import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['rotexautomation.com'],
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "cdn.rotex.com" },
      { protocol: "https", hostname: "rotex.ezzystack.com" },
    ],
  },
  
  experimental: {
    // Admin media uploads (video especially) exceed the 1MB Server Action default.
    serverActions: { bodySizeLimit: "200mb" },
  },
  async rewrites() {
    return {
      beforeFiles: [],
      // afterFiles runs only when nothing in public/ matched, so files that were
      // present at build time keep their fast static path and newly uploaded
      // ones fall through to the API route that reads from disk.
      afterFiles: [{ source: "/uploads/:path*", destination: "/api/uploads/:path*" }],
      fallback: [],
    };
  },
  // Legacy URL redirects from the old site. Source: docs/Rotex 301 Redirection(301).csv
  async redirects() {
    return [
      // success-stories -> case-studies
      { source: "/success-stories/isros-mahendragiri-facility", destination: "/case-studies/isros-mahendragiri-facility", permanent: true },
      { source: "/success-stories/railway/rotexs-breakthrough-in-vcb-performance", destination: "/case-studies/rotexs-breakthrough-in-vcb-performance", permanent: true },
      { source: "/success-stories/railway/rotex-axle-mounted-disc-brake-innovation", destination: "/case-studies/rotex-axle-mounted-disc-brake-innovation", permanent: true },
      { source: "/success-stories/railway/how-rotex-is-shaping-the-future-of-train-coach-sliding-doors", destination: "/case-studies/how-rotex-is-shaping-the-future-of-train-coach-sliding-doors", permanent: true },
      { source: "/success-stories/railway/railway-advanced-brake-actuation-technology", destination: "/case-studies/railway-advanced-brake-actuation-technology", permanent: true },
      { source: "/success-stories/the-sonex-machines-story-success-with-rotex-pulse-jet-valves", destination: "/case-studies/the-sonex-machines-story-success-with-rotex-pulse-jet-valves", permanent: true },

      // news-events -> news-updates
      { source: "/news-events/rotex-at-iree-2025", destination: "/news-updates/rotex-at-iree-2025", permanent: true },
      { source: "/news-events/diya-decoration-2025", destination: "/news-updates/diya-decoration-2025", permanent: true },
      { source: "/news-events/global-recycling-day-2025", destination: "/news-updates/global-recycling-day-2025", permanent: true },
      { source: "/news-events/world-environment-day-2025", destination: "/news-updates/world-environment-day-2025", permanent: true },
      { source: "/news-events/siat-2026", destination: "/news-updates/siat-2026", permanent: true },
      { source: "/news-events/cgd-conference-2026", destination: "/news-updates/cgd-conference-2026", permanent: true },
      { source: "/news-events/rotex-qatarenergy-pml-solenoid-valves", destination: "/news-updates/rotex-qatarenergy-pml-solenoid-valves", permanent: true },
      { source: "/news-events/valve-world-expo-india", destination: "/news-updates/valve-world-expo-india", permanent: true },
      { source: "/news-events/valve-world-expo-china", destination: "/news-updates/valve-world-expo-china", permanent: true },
      { source: "/news-events/rog-e-2026", destination: "/news-updates/rog-e-2026", permanent: true },

      // insights -> blogs
      { source: "/insights/solenoid-valve-manufacturer-selection-guide", destination: "/blogs/solenoid-valve-manufacturer-selection-guide", permanent: true },
      { source: "/insights/solenoid-valve-types-classification-guide", destination: "/blogs/solenoid-valve-types-classification-guide", permanent: true },
      { source: "/insights/future-of-industrial-valves-7-rotex-technologies", destination: "/blogs/future-of-industrial-valves-7-rotex-technologies", permanent: true },
      { source: "/insights/how-to-select-the-right-solenoid-valve", destination: "/blogs/how-to-select-the-right-solenoid-valve", permanent: true },
      { source: "/insights/role-of-solenoid-valves-in-heavy-vehicle-engineering", destination: "/blogs/role-of-solenoid-valves-in-heavy-vehicle-engineering", permanent: true },
      { source: "/insights/solenoid-valve-problems-troubleshooting-guide", destination: "/blogs/solenoid-valve-problems-troubleshooting-guide", permanent: true },
      { source: "/insights/5th-gen-2oo3-redundant-solenoid-valve", destination: "/blogs/2oo3-with-3-sov-solution", permanent: true },
      { source: "/insights/explosion-proof-solenoid-valves-explained", destination: "/blogs/explosion-proof-solenoid-valves-explained", permanent: true },
      { source: "/insights/normally-open-vs-normally-closed-vs-universal-solenoid-valves", destination: "/blogs/normally-open-vs-normally-closed-vs-universal-solenoid-valves", permanent: true },
      { source: "/insights/pneumatic-solenoid-valves-explained", destination: "/blogs/pneumatic-solenoid-valves-explained", permanent: true },
      { source: "/insights/12v-vs-24v-dc-solenoid-valves", destination: "/blogs/12v-vs-24v-dc-solenoid-valves", permanent: true },
      { source: "/insights/air-water-gas-solenoid-valve-comparison", destination: "/blogs/air-water-gas-solenoid-valve-comparison", permanent: true },
      { source: "/insights/2-way-vs-3-way-vs-5-way-solenoid-valve", destination: "/blogs/2-way-vs-3-way-vs-5-way-solenoid-valve", permanent: true },
      { source: "/insights/explosion-proof-ex-d-vs-intrinsically-safe-ex-i-solenoid-valve", destination: "/blogs/explosion-proof-ex-d-vs-intrinsically-safe-ex-i-solenoid-valve", permanent: true },
      { source: "/insights/pulse-jet-valves-dust-collector-working-selection-guide", destination: "/blogs/pulse-jet-valves-dust-collector-working-selection-guide", permanent: true },
      { source: "/insights/direct-acting-vs-pilot-operated-solenoid-valve", destination: "/blogs/direct-acting-vs-pilot-operated-solenoid-valve", permanent: true },

      // products
      { source: "/product-search", destination: "/search", permanent: true },
      { source: "/product-category/solenoid-valve/standard/5-way-solenoid-valve-standard", destination: "/products?category=solenoid-valve&type=5-way", permanent: true },
      { source: "/product-category/solenoid-valve/standard/3-way-solenoid-valve-standard", destination: "/products?category=solenoid-valve&type=3-way", permanent: true },
      { source: "/product-category/solenoid-valve/standard/2-way-solenoid-valve-standard", destination: "/products?category=solenoid-valve&type=2-way", permanent: true },
      { source: "/product-category/solenoid-valve", destination: "/products?category=solenoid-valve", permanent: true },
      { source: "/product-category/smart-positioner", destination: "/products?category=smart-positioner", permanent: true },
      { source: "/product-category/positioner", destination: "/products?category=positioners", permanent: true },
      { source: "/ctis", destination: "/products?category=ctis", permanent: true },
      { source: "/product-category/automotive", destination: "/products?category=automotive-valve", permanent: true },
      { source: "/product-category/angle-seat-valve", destination: "/products?category=angle-seat-valve", permanent: true },
      { source: "/product-category/ehf", destination: "/products?category=actuators", permanent: true },
      { source: "/product/51450v02", destination: "/product/single-solenoid-51450v02", permanent: true },
      { source: "/product/51440", destination: "/product/single-solenoid-51440", permanent: true },
      { source: "/product/51424", destination: "/product/single-solenoid-51424", permanent: true },
      { source: "/product/51400", destination: "/product/single-solenoid-51400", permanent: true },
      { source: "/product/24101", destination: "/product/pilot-operated-diaphragm-design-24101", permanent: true },
      { source: "/product/31119", destination: "/product/pilot-operated-31119", permanent: true },
      { source: "/product/57440", destination: "/product/double-solenoid-57440", permanent: true },
      { source: "/product/30334", destination: "/product/direct-acting-30334", permanent: true },
      { source: "/product/30318", destination: "/product/direct-acting-30318", permanent: true },
      { source: "/product/30308", destination: "/product/direct-acting-30308", permanent: true },
      { source: "/product/30301", destination: "/product/direct-acting-30301", permanent: true },
      { source: "/product/30125", destination: "/product/direct-acting-30125", permanent: true },
      { source: "/product/30106", destination: "/product/direct-acting-30106", permanent: true },
      { source: "/product/20126", destination: "/product/direct-acting-20126", permanent: true },
      { source: "/product/20108", destination: "/product/direct-acting-20108", permanent: true },
      { source: "/product/20101", destination: "/product/direct-acting-20101", permanent: true },
      { source: "/product/24106", destination: "/product/pilot-operated-diaphragm-design-24106", permanent: true },

      // misc
      { source: "/partner-sales-tools", destination: "/join/partner-sales-tools", permanent: true },
      { source: "/be-our-channel-partner", destination: "/join/channel-partner", permanent: true },
      { source: "/career", destination: "/join/career", permanent: true },
      { source: "/railway", destination: "/industries/rail", permanent: true },
      { source: "/industries/oil-and-gas", destination: "/industries/oil-gas", permanent: true },
      { source: "/industries/automotive-solenoid-valve", destination: "/industries/automotive", permanent: true },
      { source: "/reach-us", destination: "/contact", permanent: true },
      { source: "/enquiry", destination: "/contact", permanent: true },
      { source: "/qc", destination: "https://docs.google.com/forms/d/e/1FAIpQLSd_VTlOHE8h9-q1PurKz1x-ObCXCkMWoLk1uT3HWDg04D1aHA/viewform", permanent: true },
    ];
  },
};

export default nextConfig;
