# About Page CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all 11 content sections of the public `/about` page editable from the admin panel, using the same `key → JSON blob` pattern already used for the Home page CMS.

**Architecture:** New `AboutSection` Prisma model (`key`, `enabled`, `order`, `data Json`) — one row per section. A shared `getAboutSection(key)` server helper resolves relational fields (partner logos, resource picks) and is called by one thin API route per key (`/api/v1/about/<key>`). The public `/about` page fetches all 11 sections server-side via a new `fetchAboutSection` helper and passes the data into the existing (already prop-driven) section components. The admin panel gets a list page (`/admin/about`) and one edit page per key (`/admin/about/<key>`), each rendering a dedicated form built from the same shared primitives (`SectionMeta`, `SaveBar`, `TextField`, `MediaField`, `useFieldArray`, `useSaveAction`) already used by the Home CMS forms.

**Tech Stack:** Next.js App Router (server components + server actions), Prisma (SQLite, `prisma-client` + `prisma-json-types-generator`), react-hook-form, Tailwind, shadcn/ui primitives.

## Global Constraints

- No drag-to-reorder for About sections — order is fixed in code (`order` column exists only for consistent seeding/listing, not user-editable).
- Every section keeps an `enabled` toggle; the public page must skip rendering a section when `enabled` is `false`, exactly like `src/app/(site)/page.tsx` does for Home sections (`{section?.enabled && <Component ... />}`).
- Scope is `/about` only — do not touch `/about/awards`.
- Follow existing naming/patterns from the Home CMS exactly: `save<X>Section` / `toggle<X>SectionEnabled` action names, `SectionMeta`/`SaveBar` shell, `initialEnabled`/`initialData` form props.
- Data shapes below are locked — every task must use these exact field names.

### Locked data shapes (per section `key`)

```ts
// hero
{ breadcrumbLabel: string; title: string; description: string; cta: { label: string; href: string } }

// story
{ heading: string; paragraphs: string[]; stats: { value: string; label: string }[];
  trustedLabel: string; partnerIds: string[]; videoSrc: string }
// resolved (API output) adds: logos: { id: string; src: string; alt: string }[] (partnerIds dropped)

// mission-vision
{ mission: string; vision: string }

// values
{ heading: string; subheading: string; values: { title: string; description: string }[] }

// journey
{ heading: string; milestones: { year: string; title: string; description: string }[] }

// trusted-countries
{ title: string; description: string }

// zero-downtime-cta
{ title: string; description: string;
  ctaPrimary: { label: string; href: string }; ctaSecondary: { label: string; href: string } }

// grow-with-rotex
{ title: string; description: string; image: string; cta: { label: string; href: string } }

// achievements
{ heading: string; achievements: { badge: "rail" | "zed" | "trophy"; text: string }[];
  cta: { label: string; href: string } }

// gallery
{ images: { src: string; alt: string }[] }

// resources
{ heading: { title: string }; tabs: { id: string; label: string; cta: { label: string; href: string }; resourceIds: string[] }[] }
// resolved (API output) replaces resourceIds with: resources: { id: string; type: string; title: string; slug: string; image: string }[]
```

---

### Task 1: `AboutSection` Prisma model + migration

**Files:**
- Modify: `prisma/schema.prisma` (add model, after the `HomeSection` model at line 156-162)

**Interfaces:**
- Produces: `prisma.aboutSection` client with `{ key: string, enabled: boolean, order: number, data: unknown, updatedAt: Date }`, used by every later task.

- [ ] **Step 1: Add the model to the schema**

In `prisma/schema.prisma`, immediately after the closing `}` of `model HomeSection` (line 162), add:

```prisma
model AboutSection {
  key       String   @id
  enabled   Boolean  @default(true)
  order     Int
  data      Json
  updatedAt DateTime @updatedAt
}
```

- [ ] **Step 2: Run the migration**

Run: `npx prisma migrate dev --name add_about_section`
Expected: migration created under `prisma/migrations/`, applies cleanly, ends with "Your database is now in sync with your schema."

- [ ] **Step 3: Verify the client generated the new model**

Run: `grep -n "aboutSection" src/generated/prisma/client.ts | head -3` (or equivalent generated file for this Prisma version)
Expected: at least one match confirming `AboutSection` model exists on the generated client.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: add AboutSection model for About page CMS"
```

---

### Task 2: Seed script with current hardcoded content

**Files:**
- Create: `prisma/seed-about.ts`

**Interfaces:**
- Consumes: `prisma.aboutSection.upsert`, `prisma.partner.findMany` (from Task 1's model and existing `Partner` model).
- Produces: 11 seeded `AboutSection` rows (`hero`, `story`, `mission-vision`, `values`, `journey`, `trusted-countries`, `zero-downtime-cta`, `grow-with-rotex`, `achievements`, `gallery`, `resources`), each `order` 1-11 in the page's render order, each `enabled: true`.

- [ ] **Step 1: Write the seed script**

Create `prisma/seed-about.ts`:

```ts
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!.replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

const SECTIONS: { key: string; order: number; data: unknown }[] = [
  {
    key: "hero",
    order: 1,
    data: {
      breadcrumbLabel: "About Us",
      title: "Empowering Industries. Where It Matters Most.",
      description:
        "Engineered flow control solutions designed to perform where operational failure is not an option - across Oil & Gas, Chemical, Power, Pharma, Automotive, and global process industries.",
      cta: { label: "Talk to Expert", href: "/contact" },
    },
  },
  {
    key: "story",
    order: 2,
    data: {
      heading: "Our Story",
      paragraphs: [
        "In 1967, in the industrial city of Vadodara, India, a company was founded with a single obsession: build flow control components so precisely engineered that the process plants which depend on them never have to think about them again.",
        "That obsession did not change as Rotex grew. It deepened. Each decade brought new industries, new continents, and new applications: gas fields in Saudi Arabia, pharmaceutical cleanrooms in Europe, rocket test facilities in India, and commercial trucks crossing the Alps. The applications changed. The engineering standard never wavered.",
      ],
      stats: [
        { value: "10M+", label: "Field units operating" },
        { value: "58", label: "Years of engineering" },
        { value: "13", label: "Global certifications" },
        { value: "29+", label: "Patents protected" },
        { value: "81", label: "Countries served" },
        { value: "5", label: "Leading Oil & Gas operators served" },
      ],
      trustedLabel: "Trusted by Industry leaders",
      partnerIds: [],
      videoSrc: "/media/about-us.mp4",
    },
  },
  {
    key: "mission-vision",
    order: 3,
    data: {
      mission:
        "To deliver highly engineered fluid control solutions that make industry run safer, smarter and more efficiently, with an unwavering focus on technology, quality and performance.",
      vision:
        "Providing customers with fluid control automation solutions with utmost safety, efficiency and control to harness the power of fluids.",
    },
  },
  {
    key: "values",
    order: 4,
    data: {
      heading: "Built Beyond Standards",
      subheading: "The values behind our engineering, speed, and global trust.",
      values: [
        {
          title: "Engineer the root. Not the symptom.",
          description:
            "When a valve fails repeatedly, most manufacturers improve the replacement process. We investigate why it failed and eliminate the failure mode permanently. 73% of solenoid valve failures trace to one root cause — contamination from conventional spool designs. We replaced the spool.",
        },
        {
          title: "The specification is the floor, not the ceiling.",
          description:
            "Meeting the printed spec is the minimum bar, not the target. We engineer margin into every component so it keeps performing long after the datasheet numbers are tested.",
        },
        {
          title: "Every application is unique. Every solution should be.",
          description:
            "No two installations face identical pressure, temperature, or contamination profiles. We configure every solution around the operating conditions it will actually face — not a generic default.",
        },
        {
          title: "Speed without compromise is an engineering achievement, not a shortcut.",
          description: "We move fast without cutting corners on quality or safety.",
        },
        {
          title: "Global trust is earned one installation at a time.",
          description: "Every deployment, in every country, upholds the same engineering standard.",
        },
      ],
    },
  },
  {
    key: "journey",
    order: 5,
    data: {
      heading: "Our Journey",
      milestones: [
        { year: "1967", title: "Foundation of Rotex", description: "Rotex was established by Mr. Jitendra Shah for the manufacturing of textile machinery under the name Rotex – Rotating Textile Machinery." },
        { year: "1974", title: "International Technical Collaboration", description: "Rotex entered into a technical collaboration with the Swiss company Eugen Seitz for the manufacturing of solenoid valves." },
        { year: "1976", title: "Entry into Solenoid Valve Manufacturing", description: "Started manufacturing high-quality solenoid valves, marking the beginning of Rotex's journey in fluid automation." },
        { year: "1983", title: "Manufacturing Shift to Vadodara", description: "The manufacturing operations for solenoid valves were shifted to Vadodara, Gujarat." },
        { year: "1988", title: "Expansion with a New Manufacturing Unit", description: "To meet growing demand, Rotex established an additional manufacturing facility at Vitthal Udyognagar, Anand." },
        { year: "1991", title: "Mumbai Plant Restarted", description: "The Mumbai plant resumed operations with manufacturing focused on pneumatic actuators and cylinders." },
        { year: "2000", title: "ISO 9001 Certification Achieved", description: "Rotex became ISO 9001 certified, reinforcing its commitment to quality management systems." },
        { year: "2001", title: "ATEX Certification for Exd Solenoid Valves", description: "Received ATEX certification for flameproof (Exd) solenoid valves." },
        { year: "2006", title: "ATEX Certification for Exia Solenoid Valves", description: "Expanded hazardous area product offerings with ATEX certification for intrinsically safe (Exia) solenoid valves." },
        { year: "2007", title: "PED Certification", description: "Rotex's solenoid valve program received Pressure Equipment Directive (PED) certification." },
        { year: "2009", title: "Global Industry Approvals", description: "Obtained prestigious certifications and approvals including GOST and INMETRO." },
        { year: "2012", title: "SIL3 Certification", description: "Achieved SIL3 certification, strengthening Rotex's position in safety-critical automation applications." },
        { year: "2014", title: "Strategic Acquisition", description: "Acquired the German company Maxsev Valves GmbH, expanding Rotex's global footprint and technological capabilities." },
        { year: "2017", title: "International Safety & Quality Standards", description: "Obtained ISO 14001, ISO 45001, and KOSHA certifications." },
        { year: "2018", title: "Business Restructuring", description: "Divested the pneumatic actuator, cylinder, ball valve, and butterfly valve business divisions." },
        { year: "2022", title: "UL Certification for Exd Solenoid Valves", description: "Received UL certification for Exd solenoid valves, enhancing global market acceptance." },
        { year: "2023", title: "JAPANEx Certification", description: "Achieved JAPANEx certification, strengthening Rotex's presence in international hazardous-area markets." },
        { year: "2025", title: "Major Expansion & Certification Milestone", description: "Expanded operations with a 1.3 million sq. ft. land development and achieved the BS EN 161 Kitemark Certification." },
      ],
    },
  },
  {
    key: "trusted-countries",
    order: 6,
    data: {
      title: "Trusted across 81 countries.",
      description:
        "From North Sea offshore platforms to Qatar gas fields, German cleanrooms, and Indian cement plants, Rotex is specified where precision matters and failure is not allowed.",
    },
  },
  {
    key: "zero-downtime-cta",
    order: 7,
    data: {
      title: "Ready to engineer Zero Downtime into your plant?",
      description:
        "The N2W Zero Downtime Consultation applies 58 years of field-validated engineering to your specific plant - and identifies the failure modes most likely to cause your next shutdown. 45 minutes. No sales content. Written analysis in 48 hours.",
      ctaPrimary: { label: "Book Free Consultation", href: "/contact" },
      ctaSecondary: { label: "Download N2W Framework", href: "/downloads" },
    },
  },
  {
    key: "grow-with-rotex",
    order: 8,
    data: {
      title: "Grow With Rotex",
      description:
        "Join our global distribution network and deliver precision-engineered flow control solutions trusted across critical industries.",
      image: "",
      cta: { label: "Become a Partner", href: "/join/channel-partner" },
    },
  },
  {
    key: "achievements",
    order: 9,
    data: {
      heading: "What We Achieved So Far",
      achievements: [
        { badge: "rail", text: 'Featured as one of the "100 Innovative Companies in the Rail Sector of India".' },
        { badge: "zed", text: "Quality and compliance recognition for the manufacturing unit." },
        { badge: "trophy", text: '1st Runner-Up at the National-Level Indian Society for Quality (ISQ) Competition for the "Aarambh" Case Study.' },
      ],
      cta: { label: "See More of Our Wins", href: "/about/awards" },
    },
  },
  {
    key: "gallery",
    order: 10,
    data: { images: [] },
  },
  {
    key: "resources",
    order: 11,
    data: {
      heading: { title: "Resources" },
      tabs: [
        { id: "case-studies", label: "Case Studies", cta: { label: "Read All Case Studies", href: "/case-studies" }, resourceIds: [] },
        { id: "news", label: "News & Updates", cta: { label: "View All News & Updates", href: "/news-updates" }, resourceIds: [] },
        { id: "blogs", label: "Blogs", cta: { label: "Read All Blogs", href: "/blogs" }, resourceIds: [] },
      ],
    },
  },
];

async function main() {
  for (const section of SECTIONS) {
    await prisma.aboutSection.upsert({
      where: { key: section.key },
      update: { order: section.order, data: section.data as never },
      create: { key: section.key, order: section.order, enabled: true, data: section.data as never },
    });
  }

  console.log(`Seeded ${SECTIONS.length} about sections.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Run the seed**

Run: `npx tsx prisma/seed-about.ts`
Expected: prints `Seeded 11 about sections.` with no errors.

- [ ] **Step 3: Verify rows landed**

Run: `npx tsx -e "import {PrismaClient} from './src/generated/prisma/client'; import {PrismaBetterSqlite3} from '@prisma/adapter-better-sqlite3'; const p=new PrismaClient({adapter:new PrismaBetterSqlite3({url:process.env.DATABASE_URL!.replace(/^file:/,'')})}); p.aboutSection.count().then(c=>{console.log(c); p.\$disconnect();})"`
Expected: prints `11`.

- [ ] **Step 4: Commit**

```bash
git add prisma/seed-about.ts
git commit -m "feat: seed About page CMS sections with current content"
```

---

### Task 3: `getAboutSection` helper + 11 API routes

**Files:**
- Create: `src/lib/about-section.ts`
- Create: `src/app/api/v1/about/hero/route.ts`
- Create: `src/app/api/v1/about/story/route.ts`
- Create: `src/app/api/v1/about/mission-vision/route.ts`
- Create: `src/app/api/v1/about/values/route.ts`
- Create: `src/app/api/v1/about/journey/route.ts`
- Create: `src/app/api/v1/about/trusted-countries/route.ts`
- Create: `src/app/api/v1/about/zero-downtime-cta/route.ts`
- Create: `src/app/api/v1/about/grow-with-rotex/route.ts`
- Create: `src/app/api/v1/about/achievements/route.ts`
- Create: `src/app/api/v1/about/gallery/route.ts`
- Create: `src/app/api/v1/about/resources/route.ts`

**Interfaces:**
- Consumes: `apiSuccess`/`apiError` from `src/lib/api-response.ts`, `getSelectedPartners` from `src/lib/partners.ts`, `prisma.aboutSection` and `prisma.resource` from Tasks 1-2.
- Produces: `getAboutSection(key: string)` returning a `NextResponse` — same contract as `getHomeSection`, consumed by Task 4's `fetchAboutSection`.

- [ ] **Step 1: Write the helper**

Create `src/lib/about-section.ts`:

```ts
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getSelectedPartners } from "@/lib/partners";

export async function getAboutSection(key: string) {
  const section = await prisma.aboutSection.findUnique({ where: { key } });

  if (!section) {
    return apiError("NOT_FOUND", `Section "${key}" not found`, 404);
  }

  const data = section.data as Record<string, unknown>;

  if (key === "story") {
    const partners = await getSelectedPartners((data.partnerIds as string[]) ?? []);
    const logos = partners.map((p) => ({ id: p.id, src: p.logo, alt: p.name }));
    const { partnerIds: _partnerIds, ...rest } = data;
    return apiSuccess({ enabled: section.enabled, ...rest, logos }, section.updatedAt);
  }

  if (key === "resources") {
    const tabs =
      (data.tabs as { id: string; label: string; cta: { label: string; href: string }; resourceIds?: string[] }[]) ?? [];
    const resolvedTabs = await Promise.all(
      tabs.map(async (tab) => {
        const ids = tab.resourceIds ?? [];
        const resources = ids.length
          ? await prisma.resource.findMany({ where: { id: { in: ids }, published: true } })
          : [];
        const byId = new Map(resources.map((r) => [r.id, r]));
        const ordered = ids.map((id) => byId.get(id)).filter((r): r is NonNullable<typeof r> => Boolean(r));
        return { id: tab.id, label: tab.label, cta: tab.cta, resources: ordered };
      })
    );
    return apiSuccess({ enabled: section.enabled, heading: data.heading, tabs: resolvedTabs }, section.updatedAt);
  }

  return apiSuccess({ enabled: section.enabled, ...data }, section.updatedAt);
}
```

- [ ] **Step 2: Write the 11 route files**

Each file follows this exact shape (only the key and folder differ):

`src/app/api/v1/about/hero/route.ts`
```ts
import { getAboutSection } from "@/lib/about-section";

export async function GET() {
  return getAboutSection("hero");
}
```

Repeat verbatim (swap only the string literal passed to `getAboutSection`) for:
- `src/app/api/v1/about/story/route.ts` → `getAboutSection("story")`
- `src/app/api/v1/about/mission-vision/route.ts` → `getAboutSection("mission-vision")`
- `src/app/api/v1/about/values/route.ts` → `getAboutSection("values")`
- `src/app/api/v1/about/journey/route.ts` → `getAboutSection("journey")`
- `src/app/api/v1/about/trusted-countries/route.ts` → `getAboutSection("trusted-countries")`
- `src/app/api/v1/about/zero-downtime-cta/route.ts` → `getAboutSection("zero-downtime-cta")`
- `src/app/api/v1/about/grow-with-rotex/route.ts` → `getAboutSection("grow-with-rotex")`
- `src/app/api/v1/about/achievements/route.ts` → `getAboutSection("achievements")`
- `src/app/api/v1/about/gallery/route.ts` → `getAboutSection("gallery")`
- `src/app/api/v1/about/resources/route.ts` → `getAboutSection("resources")`

- [ ] **Step 3: Verify the routes respond**

Run: `npm run dev &` then, once started, `curl -s http://localhost:5007/api/v1/about/hero | head -c 300; echo` (adjust port if `dev` uses Next's default 3000 — check terminal output for the actual port), then stop the dev server.
Expected: JSON with `"success":true` and `"data":{"enabled":true,"breadcrumbLabel":"About Us",...}`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/about-section.ts src/app/api/v1/about
git commit -m "feat: add About section API routes"
```

---

### Task 4: `fetchAboutSection` + wire `/about` page to CMS data

**Files:**
- Modify: `src/lib/site-api.ts` (add function near `fetchHomeSection`, same file, after its closing brace at line 37)
- Modify: `src/app/(site)/about/page.tsx` (full rewrite of the fetch/render logic; keep imports of section components)
- Modify: `src/components/sections/about-hero-section.tsx` (add `breadcrumbLabel` prop)
- Modify: `src/components/sections/zero-downtime-cta-section.tsx` (add `ctaPrimary`/`ctaSecondary` props)
- Modify: `src/components/sections/gallery-swiper-section.tsx` (widen `GalleryImage.src` to accept `string`)

**Interfaces:**
- Consumes: `getAboutSection` (Task 3, indirectly via the API route), section components' existing prop types.
- Produces: `fetchAboutSection<T extends object>(key: string): Promise<({ enabled: boolean } & T) | null>`, used only here in this task.

- [ ] **Step 1: Add `fetchAboutSection` to `site-api.ts`**

In `src/lib/site-api.ts`, after the closing `}` of `fetchHomeSection` (line 37), add:

```ts
/**
 * Fetches an about page section through /api/v1/about/[key], mirroring fetchHomeSection.
 */
export async function fetchAboutSection<T extends object>(
  key: string
): Promise<({ enabled: boolean } & T) | null> {
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/v1/about/${key}`, { cache: "no-store" });

    if (!res.ok) {
      console.error(`[site-api] GET /api/v1/about/${key} → ${res.status}`);
      return null;
    }

    const json = await res.json();
    if (!json.success) {
      console.error(`[site-api] GET /api/v1/about/${key} → ${json.error?.code}: ${json.error?.message}`);
      return null;
    }

    return json.data;
  } catch (err) {
    console.error(`[site-api] GET /api/v1/about/${key} failed:`, err);
    return null;
  }
}
```

- [ ] **Step 2: Add `breadcrumbLabel` prop to `AboutHeroSection`**

In `src/components/sections/about-hero-section.tsx`, change the props type (lines 3-7) and the breadcrumb span:

```ts
type AboutHeroSectionProps = {
  title: string;
  description?: string;
  breadcrumbLabel?: string;
  children?: React.ReactNode;
};
```

```tsx
export function AboutHeroSection({ title, description, breadcrumbLabel = "About Us", children }: AboutHeroSectionProps) {
```

And replace the hardcoded breadcrumb text:
```tsx
          <span className="text-red-600 text-sm font-semibold font-montserrat leading-5">
            {breadcrumbLabel}
          </span>
```

- [ ] **Step 3: Add CTA props to `ZeroDowntimeCtaSection`**

In `src/components/sections/zero-downtime-cta-section.tsx`, change the props type and defaults:

```ts
type CtaButton = { label: string; href: string };

type ZeroDowntimeCtaSectionProps = {
  title?: string;
  description?: string;
  ctaPrimary?: CtaButton;
  ctaSecondary?: CtaButton;
};

const CTA_SHADOW = "shadow-[0px_13px_7.8px_-12px_rgba(0,0,0,0.25)]";

export function ZeroDowntimeCtaSection({
  title = "Ready to engineer Zero Downtime into your plant?",
  description = "The N2W Zero Downtime Consultation applies 58 years of field-validated engineering to your specific plant - and identifies the failure modes most likely to cause your next shutdown. 45 minutes. No sales content. Written analysis in 48 hours.",
  ctaPrimary = { label: "Book Free Consultation", href: "/contact" },
  ctaSecondary = { label: "Download N2W Framework", href: "/downloads" },
}: ZeroDowntimeCtaSectionProps) {
```

And replace the two hardcoded `PillButton`s in the JSX (inside the `flex flex-wrap` div) with:

```tsx
            <PillButton
              href={ctaPrimary.href}
              tone="lightOrange"
              size="md"
              className={`font-bold ${CTA_SHADOW}`}
            >
              {ctaPrimary.label}
            </PillButton>
            <PillButton
              href={ctaSecondary.href}
              tone="dark"
              size="md"
              className={`font-bold outline-1 -outline-offset-1 outline-primary ${CTA_SHADOW}`}
            >
              {ctaSecondary.label}
            </PillButton>
```

- [ ] **Step 4: Widen `GallerySwiperSection` image type to accept CMS-uploaded string URLs**

In `src/components/sections/gallery-swiper-section.tsx`, change line 16:

```ts
type GalleryImage = { src: StaticImageData | string; alt: string };
```

And in the `<Image>` render (inside the `map`), add `unoptimized` for string sources since they may be uploaded files outside the Next.js image loader's static-import optimization:

```tsx
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 60vw, (min-width: 768px) 75vw, 90vw"
                    unoptimized={typeof img.src === "string"}
                  />
```

- [ ] **Step 5: Rewrite `about/page.tsx` to fetch from CMS**

Replace the full contents of `src/app/(site)/about/page.tsx` with:

```tsx
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
```

- [ ] **Step 6: Verify with lint + build**

Run: `npm run lint`
Expected: no errors in the changed files.

Run: `npm run build`
Expected: build succeeds (About page compiles as a dynamic/server-rendered route since it fetches with `cache: "no-store"`).

- [ ] **Step 7: Commit**

```bash
git add src/lib/site-api.ts "src/app/(site)/about/page.tsx" src/components/sections/about-hero-section.tsx src/components/sections/zero-downtime-cta-section.tsx src/components/sections/gallery-swiper-section.tsx
git commit -m "feat: wire About page to CMS data"
```

---

### Task 5: Admin actions, list page, sidebar nav

**Files:**
- Create: `src/app/admin/(dashboard)/about/actions.ts`
- Create: `src/app/admin/(dashboard)/about/page.tsx`
- Modify: `src/components/admin/sidebar.tsx`

**Interfaces:**
- Consumes: `prisma.aboutSection` (Task 1).
- Produces: `saveAboutSection(key, payload)`, `toggleAboutSectionEnabled(key, enabled)` server actions, used by every form task below.

- [ ] **Step 1: Write the server actions**

Create `src/app/admin/(dashboard)/about/actions.ts`:

```ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleAboutSectionEnabled(key: string, enabled: boolean) {
  await prisma.aboutSection.update({ where: { key }, data: { enabled } });
  revalidatePath("/admin/about");
  revalidatePath("/about");
}

export async function saveAboutSection(key: string, payload: { enabled: boolean; data: unknown }) {
  await prisma.aboutSection.update({
    where: { key },
    data: { enabled: payload.enabled, data: payload.data as never },
  });

  revalidatePath("/admin/about");
  revalidatePath(`/admin/about/${key}`);
  revalidatePath("/about");
}
```

- [ ] **Step 2: Write the admin list page**

Create `src/app/admin/(dashboard)/about/page.tsx`:

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { AboutSectionRow } from "@/components/admin/about-sections/about-section-row";

const LABELS: Record<string, string> = {
  hero: "Hero",
  story: "Our Story",
  "mission-vision": "Mission & Vision",
  values: "Values",
  journey: "Journey Timeline",
  "trusted-countries": "Trusted Countries",
  "zero-downtime-cta": "Zero Downtime CTA",
  "grow-with-rotex": "Grow With Rotex",
  achievements: "Achievements",
  gallery: "Gallery",
  resources: "Resources",
};

export default async function AdminAboutPage() {
  const sections = await prisma.aboutSection.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">About Page</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit content for each section shown on the public About page. Order is fixed.
        </p>
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {sections.map((s) => (
            <AboutSectionRow key={s.key} sectionKey={s.key} label={LABELS[s.key] ?? s.key} enabled={s.enabled} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Write the list row component (toggle + edit link)**

Create `src/components/admin/about-sections/about-section-row.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { toggleAboutSectionEnabled } from "@/app/admin/(dashboard)/about/actions";

export function AboutSectionRow({
  sectionKey,
  label,
  enabled,
}: {
  sectionKey: string;
  label: string;
  enabled: boolean;
}) {
  const [checked, setChecked] = useState(enabled);
  const [pending, startTransition] = useTransition();

  function onToggle(value: boolean) {
    setChecked(value);
    startTransition(() => toggleAboutSectionEnabled(sectionKey, value));
  }

  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-3">
        <Switch checked={checked} onCheckedChange={onToggle} disabled={pending} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <Link href={`/admin/about/${sectionKey}`}>
        <Button variant="ghost" size="sm" className="gap-1">
          Edit
          <ChevronRight className="size-3.5" />
        </Button>
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Add sidebar nav entry**

In `src/components/admin/sidebar.tsx`, add `Info` (or reuse `BookOpen`-adjacent icon) to the `lucide-react` import on line 8 and insert a new nav item right after `/admin/home`:

```ts
import { LayoutDashboard, Package, Factory, Home, Info, Settings, Handshake, Quote, Mail, BookOpen } from "lucide-react";
```

```ts
const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/home", label: "Home Page", icon: Home },
  { href: "/admin/about", label: "About Page", icon: Info },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/industries", label: "Industries", icon: Factory },
  { href: "/admin/partners", label: "Partners", icon: Handshake },
  { href: "/admin/customer-stories", label: "Customer Stories", icon: Quote },
  { href: "/admin/resources", label: "Resources", icon: BookOpen },
  { href: "/admin/enquiries", label: "Enquiries", icon: Mail },
  { href: "/admin/global", label: "Global Config", icon: Settings },
];
```

- [ ] **Step 5: Verify**

Run: `npm run lint`
Expected: no errors.

Run: `npm run dev` (leave running), open `http://localhost:5007/admin/about` (or whatever port `next dev` reports) in a browser after logging into `/admin/login`.
Expected: 11 rows listed with labels from `LABELS`, each with a working toggle and an "Edit" link (edit pages 404 until Task 6-16 land — that's expected at this point). Stop the dev server after checking.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/\(dashboard\)/about/actions.ts src/app/admin/\(dashboard\)/about/page.tsx src/components/admin/about-sections/about-section-row.tsx src/components/admin/sidebar.tsx
git commit -m "feat: add About page CMS admin list page and nav entry"
```

---

### Task 6: Hero form

**Files:**
- Create: `src/components/admin/about-sections/hero-form.tsx`

**Interfaces:**
- Consumes: `SectionMeta`, `SaveBar` (`src/components/admin/section-form-shell.tsx`), `TextField`, `TextAreaField`, `FieldGrid` (`src/components/admin/form-fields.tsx`), `useSaveAction` (`src/hooks/use-save-action.ts`), `saveAboutSection` (Task 5).
- Produces: `HeroForm` component, wired in Task 17's `[key]/page.tsx`. Data shape: `{ breadcrumbLabel: string; title: string; description: string; cta: { label: string; href: string } }`.

- [ ] **Step 1: Write the form**

Create `src/components/admin/about-sections/hero-form.tsx`:

```tsx
"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, FieldGrid } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type FormValues = {
  enabled: boolean;
  breadcrumbLabel: string;
  title: string;
  description: string;
  cta: { label: string; href: string };
};

export function HeroForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: Omit<FormValues, "enabled">;
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("hero", { enabled, data });
        toast.success("Hero section saved");
      } catch (err) {
        toast.error("Failed to save hero section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Breadcrumb Label" {...form.register("breadcrumbLabel")} />
        <TextField label="Title" {...form.register("title")} />
        <TextAreaField label="Description" {...form.register("description")} />
        <FieldGrid>
          <TextField label="CTA Label" {...form.register("cta.label")} />
          <TextField label="CTA Href" {...form.register("cta.href")} />
        </FieldGrid>
        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint -- src/components/admin/about-sections/hero-form.tsx`
Expected: no errors. (This component isn't reachable from a page yet — Task 17 wires it in; full manual verification happens there.)

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/about-sections/hero-form.tsx
git commit -m "feat: add About hero section admin form"
```

---

### Task 7: Story form (paragraphs, stats, partner logo picker, video)

**Files:**
- Create: `src/components/admin/about-sections/story-form.tsx`

**Interfaces:**
- Consumes: `useFieldArray`, `AddButton`, `RepeaterItem`, `FieldGrid`, `TextField`, `TextAreaField` (form-fields.tsx), `Switch` (`src/components/ui/switch.tsx`), `saveAboutSection`.
- Produces: `StoryForm`, requiring an `allPartners: { id: string; name: string; logo: string }[]` prop (fetched in Task 17's `[key]/page.tsx`, same query already used for Home's `partners`/`certifications` keys).

- [ ] **Step 1: Write the form**

Create `src/components/admin/about-sections/story-form.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useForm, FormProvider, useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, FieldGrid, AddButton, RepeaterItem } from "@/components/admin/form-fields";
import { Switch } from "@/components/ui/switch";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type Partner = { id: string; name: string; logo: string };
type FormValues = {
  enabled: boolean;
  heading: string;
  paragraphs: { text: string }[];
  stats: { value: string; label: string }[];
  trustedLabel: string;
  partnerIds: string[];
  videoSrc: string;
};

export function StoryForm({
  initialEnabled,
  initialData,
  allPartners,
}: {
  initialEnabled: boolean;
  initialData: {
    heading: string;
    paragraphs: string[];
    stats: { value: string; label: string }[];
    trustedLabel: string;
    partnerIds: string[];
    videoSrc: string;
  };
  allPartners: Partner[];
}) {
  const form = useForm<FormValues>({
    defaultValues: {
      enabled: initialEnabled,
      heading: initialData.heading,
      paragraphs: initialData.paragraphs.map((text) => ({ text })),
      stats: initialData.stats,
      trustedLabel: initialData.trustedLabel,
      partnerIds: initialData.partnerIds ?? [],
      videoSrc: initialData.videoSrc,
    },
  });
  const paragraphArray = useFieldArray({ control: form.control, name: "paragraphs" });
  const statsArray = useFieldArray({ control: form.control, name: "stats" });
  const { pending, error, success, run } = useSaveAction();
  const selectedPartners = form.watch("partnerIds");

  function togglePartner(id: string, checked: boolean) {
    const current = form.getValues("partnerIds");
    form.setValue("partnerIds", checked ? [...current, id] : current.filter((p) => p !== id));
  }

  function onSubmit(values: FormValues) {
    const { enabled, paragraphs, ...rest } = values;
    const data = { ...rest, paragraphs: paragraphs.map((p) => p.text) };
    run(async () => {
      try {
        await saveAboutSection("story", { enabled, data });
        toast.success("Story section saved");
      } catch (err) {
        toast.error("Failed to save story section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading" {...form.register("heading")} />

        <div className="space-y-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Paragraphs</span>
          {paragraphArray.fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Paragraph ${i + 1}`} onRemove={() => paragraphArray.remove(i)}>
              <TextAreaField label="Text" {...form.register(`paragraphs.${i}.text`)} />
            </RepeaterItem>
          ))}
          <AddButton label="Add Paragraph" onClick={() => paragraphArray.append({ text: "" })} />
        </div>

        <div className="space-y-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Stats</span>
          {statsArray.fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Stat ${i + 1}`} onRemove={() => statsArray.remove(i)}>
              <FieldGrid>
                <TextField label="Value" {...form.register(`stats.${i}.value`)} />
                <TextField label="Label" {...form.register(`stats.${i}.label`)} />
              </FieldGrid>
            </RepeaterItem>
          ))}
          <AddButton label="Add Stat" onClick={() => statsArray.append({ value: "", label: "" })} />
        </div>

        <TextField label="Trusted Label" {...form.register("trustedLabel")} />
        <TextField label="Video Src" {...form.register("videoSrc")} />

        <div className="space-y-1 rounded-lg border border-border">
          <span className="block p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Trusted Partner Logos
          </span>
          {allPartners.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No published partners yet. Add some on the Partners page first.
            </p>
          )}
          {allPartners.map((partner) => (
            <div key={partner.id} className="flex items-center gap-4 border-t border-border p-4">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
                {partner.logo && (
                  <Image src={partner.logo} alt={partner.name} width={40} height={40} className="size-full object-contain" unoptimized />
                )}
              </div>
              <span className="flex-1 text-sm font-medium">{partner.name}</span>
              <Switch
                checked={selectedPartners.includes(partner.id)}
                onCheckedChange={(v) => togglePartner(partner.id, v)}
              />
            </div>
          ))}
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}

function _unusedTypeCheck(f: ReturnType<typeof useFormContext<FormValues>>) {
  return f;
}
```

Note: remove the trailing `_unusedTypeCheck` helper — it isn't needed. Delete that function from the file; it was left in by mistake during drafting and would trip the lint's no-unused-vars rule.

- [ ] **Step 2: Verify**

Run: `npm run lint -- src/components/admin/about-sections/story-form.tsx`
Expected: no errors, no unused-var warnings.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/about-sections/story-form.tsx
git commit -m "feat: add About story section admin form"
```

---

### Task 8: Mission & Vision form

**Files:**
- Create: `src/components/admin/about-sections/mission-vision-form.tsx`

**Interfaces:**
- Produces: `MissionVisionForm`, data shape `{ mission: string; vision: string }`.

- [ ] **Step 1: Write the form**

Create `src/components/admin/about-sections/mission-vision-form.tsx`:

```tsx
"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextAreaField } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type FormValues = { enabled: boolean; mission: string; vision: string };

export function MissionVisionForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { mission: string; vision: string };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("mission-vision", { enabled, data });
        toast.success("Mission & Vision section saved");
      } catch (err) {
        toast.error("Failed to save Mission & Vision section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextAreaField label="Mission" rows={4} {...form.register("mission")} />
        <TextAreaField label="Vision" rows={4} {...form.register("vision")} />
        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint -- src/components/admin/about-sections/mission-vision-form.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/about-sections/mission-vision-form.tsx
git commit -m "feat: add About mission-vision section admin form"
```

---

### Task 9: Values form

**Files:**
- Create: `src/components/admin/about-sections/values-form.tsx`

**Interfaces:**
- Produces: `ValuesForm`, data shape `{ heading: string; subheading: string; values: { title: string; description: string }[] }`.

- [ ] **Step 1: Write the form**

Create `src/components/admin/about-sections/values-form.tsx`:

```tsx
"use client";

import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, AddButton, RepeaterItem } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type ValueItem = { title: string; description: string };
type FormValues = { enabled: boolean; heading: string; subheading: string; values: ValueItem[] };

export function ValuesForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { heading: string; subheading: string; values: ValueItem[] };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "values" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("values", { enabled, data });
        toast.success("Values section saved");
      } catch (err) {
        toast.error("Failed to save Values section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading" {...form.register("heading")} />
        <TextAreaField label="Subheading" {...form.register("subheading")} />

        <div className="space-y-3">
          {fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Value ${i + 1}`} onRemove={() => remove(i)}>
              <TextField label="Title" {...form.register(`values.${i}.title`)} />
              <TextAreaField label="Description" {...form.register(`values.${i}.description`)} />
            </RepeaterItem>
          ))}
          <AddButton label="Add Value" onClick={() => append({ title: "", description: "" })} />
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint -- src/components/admin/about-sections/values-form.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/about-sections/values-form.tsx
git commit -m "feat: add About values section admin form"
```

---

### Task 10: Journey Timeline form

**Files:**
- Create: `src/components/admin/about-sections/journey-form.tsx`

**Interfaces:**
- Produces: `JourneyForm`, data shape `{ heading: string; milestones: { year: string; title: string; description: string }[] }`.

- [ ] **Step 1: Write the form**

Create `src/components/admin/about-sections/journey-form.tsx`:

```tsx
"use client";

import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, FieldGrid, AddButton, RepeaterItem } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type Milestone = { year: string; title: string; description: string };
type FormValues = { enabled: boolean; heading: string; milestones: Milestone[] };

export function JourneyForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { heading: string; milestones: Milestone[] };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "milestones" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("journey", { enabled, data });
        toast.success("Journey section saved");
      } catch (err) {
        toast.error("Failed to save Journey section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading" {...form.register("heading")} />

        <div className="space-y-3">
          {fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Milestone ${i + 1}`} onRemove={() => remove(i)}>
              <FieldGrid>
                <TextField label="Year" {...form.register(`milestones.${i}.year`)} />
                <TextField label="Title" {...form.register(`milestones.${i}.title`)} />
              </FieldGrid>
              <TextAreaField label="Description" {...form.register(`milestones.${i}.description`)} />
            </RepeaterItem>
          ))}
          <AddButton
            label="Add Milestone"
            onClick={() => append({ year: "", title: "", description: "" })}
          />
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint -- src/components/admin/about-sections/journey-form.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/about-sections/journey-form.tsx
git commit -m "feat: add About journey timeline section admin form"
```

---

### Task 11: Trusted Countries form

**Files:**
- Create: `src/components/admin/about-sections/trusted-countries-form.tsx`

**Interfaces:**
- Produces: `TrustedCountriesForm`, data shape `{ title: string; description: string }`.

- [ ] **Step 1: Write the form**

Create `src/components/admin/about-sections/trusted-countries-form.tsx`:

```tsx
"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type FormValues = { enabled: boolean; title: string; description: string };

export function TrustedCountriesForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { title: string; description: string };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("trusted-countries", { enabled, data });
        toast.success("Trusted Countries section saved");
      } catch (err) {
        toast.error("Failed to save Trusted Countries section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Title" {...form.register("title")} />
        <TextAreaField label="Description" {...form.register("description")} />
        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint -- src/components/admin/about-sections/trusted-countries-form.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/about-sections/trusted-countries-form.tsx
git commit -m "feat: add About trusted-countries section admin form"
```

---

### Task 12: Zero Downtime CTA form

**Files:**
- Create: `src/components/admin/about-sections/zero-downtime-cta-form.tsx`

**Interfaces:**
- Produces: `ZeroDowntimeCtaForm`, data shape `{ title: string; description: string; ctaPrimary: {label,href}; ctaSecondary: {label,href} }`.

- [ ] **Step 1: Write the form**

Create `src/components/admin/about-sections/zero-downtime-cta-form.tsx`:

```tsx
"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, FieldGrid } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type CtaButton = { label: string; href: string };
type FormValues = {
  enabled: boolean;
  title: string;
  description: string;
  ctaPrimary: CtaButton;
  ctaSecondary: CtaButton;
};

export function ZeroDowntimeCtaForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { title: string; description: string; ctaPrimary: CtaButton; ctaSecondary: CtaButton };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("zero-downtime-cta", { enabled, data });
        toast.success("Zero Downtime CTA section saved");
      } catch (err) {
        toast.error("Failed to save Zero Downtime CTA section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Title" {...form.register("title")} />
        <TextAreaField label="Description" {...form.register("description")} />

        <div className="space-y-3 rounded-lg border border-border p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Primary CTA</span>
          <FieldGrid>
            <TextField label="Label" {...form.register("ctaPrimary.label")} />
            <TextField label="Href" {...form.register("ctaPrimary.href")} />
          </FieldGrid>
        </div>

        <div className="space-y-3 rounded-lg border border-border p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Secondary CTA</span>
          <FieldGrid>
            <TextField label="Label" {...form.register("ctaSecondary.label")} />
            <TextField label="Href" {...form.register("ctaSecondary.href")} />
          </FieldGrid>
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint -- src/components/admin/about-sections/zero-downtime-cta-form.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/about-sections/zero-downtime-cta-form.tsx
git commit -m "feat: add About zero-downtime-cta section admin form"
```

---

### Task 13: Grow With Rotex form

**Files:**
- Create: `src/components/admin/about-sections/grow-with-rotex-form.tsx`

**Interfaces:**
- Consumes: `MediaField` (`src/components/admin/media-field.tsx`) — reused here for the single `image` field even though this section has no `alt`/`type` wrapper object; the form stores the uploaded URL directly on `image`, not via `MediaField`'s `name.src` convention, so it uses `TextField` + the existing `/api/admin/upload` endpoint directly instead of `MediaField` to keep the data shape flat.
- Produces: `GrowWithRotexForm`, data shape `{ title: string; description: string; image: string; cta: {label,href} }`.

- [ ] **Step 1: Write the form**

Create `src/components/admin/about-sections/grow-with-rotex-form.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, FieldGrid, Field } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type CtaButton = { label: string; href: string };
type FormValues = { enabled: boolean; title: string; description: string; image: string; cta: CtaButton };

export function GrowWithRotexForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { title: string; description: string; image: string; cta: CtaButton };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { pending, error, success, run } = useSaveAction();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const image = useWatch({ control: form.control, name: "image" });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) form.setValue("image", json.data.url, { shouldDirty: true });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("grow-with-rotex", { enabled, data });
        toast.success("Grow With Rotex section saved");
      } catch (err) {
        toast.error("Failed to save Grow With Rotex section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Title" {...form.register("title")} />
        <TextAreaField label="Description" {...form.register("description")} />

        <Field label="Image">
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()} className="gap-1.5">
              {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
              {uploading ? "Uploading..." : "Choose File"}
            </Button>
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
        </Field>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-32 w-full rounded-lg border border-border object-cover" />
        )}

        <div className="space-y-3 rounded-lg border border-border p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">CTA</span>
          <FieldGrid>
            <TextField label="Label" {...form.register("cta.label")} />
            <TextField label="Href" {...form.register("cta.href")} />
          </FieldGrid>
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint -- src/components/admin/about-sections/grow-with-rotex-form.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/about-sections/grow-with-rotex-form.tsx
git commit -m "feat: add About grow-with-rotex section admin form"
```

---

### Task 14: Achievements form

**Files:**
- Create: `src/components/admin/about-sections/achievements-form.tsx`

**Interfaces:**
- Consumes: `SelectField` (`src/components/admin/form-fields.tsx`) for the fixed `badge` enum.
- Produces: `AchievementsForm`, data shape `{ heading: string; achievements: {badge, text}[]; cta: {label,href} }`.

- [ ] **Step 1: Write the form**

Create `src/components/admin/about-sections/achievements-form.tsx`:

```tsx
"use client";

import { useForm, FormProvider, useFieldArray, Controller } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, TextAreaField, FieldGrid, SelectField, AddButton, RepeaterItem } from "@/components/admin/form-fields";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type Badge = "rail" | "zed" | "trophy";
type Achievement = { badge: Badge; text: string };
type CtaButton = { label: string; href: string };
type FormValues = { enabled: boolean; heading: string; achievements: Achievement[]; cta: CtaButton };

const BADGE_OPTIONS = [
  { value: "rail", label: "Rail Analysis Innovation" },
  { value: "zed", label: "ZED Bronze" },
  { value: "trophy", label: "Trophy" },
];

export function AchievementsForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { heading: string; achievements: Achievement[]; cta: CtaButton };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "achievements" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("achievements", { enabled, data });
        toast.success("Achievements section saved");
      } catch (err) {
        toast.error("Failed to save Achievements section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading" {...form.register("heading")} />

        <div className="space-y-3">
          {fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Achievement ${i + 1}`} onRemove={() => remove(i)}>
              <Controller
                control={form.control}
                name={`achievements.${i}.badge`}
                render={({ field: f }) => (
                  <SelectField label="Badge" options={BADGE_OPTIONS} value={f.value} onChange={(e) => f.onChange(e.target.value)} />
                )}
              />
              <TextAreaField label="Text" {...form.register(`achievements.${i}.text`)} />
            </RepeaterItem>
          ))}
          <AddButton label="Add Achievement" onClick={() => append({ badge: "trophy", text: "" })} />
        </div>

        <div className="space-y-3 rounded-lg border border-border p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">CTA</span>
          <FieldGrid>
            <TextField label="Label" {...form.register("cta.label")} />
            <TextField label="Href" {...form.register("cta.href")} />
          </FieldGrid>
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint -- src/components/admin/about-sections/achievements-form.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/about-sections/achievements-form.tsx
git commit -m "feat: add About achievements section admin form"
```

---

### Task 15: Gallery form

**Files:**
- Create: `src/components/admin/about-sections/gallery-form.tsx`

**Interfaces:**
- Produces: `GalleryForm`, data shape `{ images: { src: string; alt: string }[] }`. Each image uses the same inline-upload approach as Task 13's `GrowWithRotexForm` (flat `src` string, not `MediaField`'s nested convention).

- [ ] **Step 1: Write the form**

Create `src/components/admin/about-sections/gallery-form.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import { useForm, FormProvider, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, AddButton, RepeaterItem } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type GalleryImage = { src: string; alt: string };
type FormValues = { enabled: boolean; images: GalleryImage[] };

export function GalleryForm({
  initialEnabled,
  initialData,
}: {
  initialEnabled: boolean;
  initialData: { images: GalleryImage[] };
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "images" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("gallery", { enabled, data });
        toast.success("Gallery section saved");
      } catch (err) {
        toast.error("Failed to save Gallery section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />

        <div className="space-y-3">
          {fields.map((field, i) => (
            <RepeaterItem key={field.id} title={`Image ${i + 1}`} onRemove={() => remove(i)}>
              <GalleryImageRow index={i} />
            </RepeaterItem>
          ))}
          <AddButton label="Add Image" onClick={() => append({ src: "", alt: "" })} />
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}

function GalleryImageRow({ index }: { index: number }) {
  const form = useFormContext<FormValues>();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const src = useWatch({ control: form.control, name: `images.${index}.src` });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) form.setValue(`images.${index}.src`, json.data.url, { shouldDirty: true });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()} className="gap-1.5">
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          {uploading ? "Uploading..." : "Choose File"}
        </Button>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-32 w-full rounded-lg border border-border object-cover" />
      )}
      <TextField label="Alt Text" {...form.register(`images.${index}.alt`)} />
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint -- src/components/admin/about-sections/gallery-form.tsx`
Expected: no errors, no unused imports/vars from the earlier draft.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/about-sections/gallery-form.tsx
git commit -m "feat: add About gallery section admin form"
```

---

### Task 16: Resources form (case studies / news / blogs picker)

**Files:**
- Create: `src/components/admin/about-sections/resources-form.tsx`

**Interfaces:**
- Produces: `ResourcesForm`, requiring an `allResources: { id: string; type: string; title: string; slug: string; image: string }[]` prop (same query Task 17 already needs to run for Home's `resources` key, filtered by `published: true`). Data shape mirrors Home's resources picker exactly: `{ heading: { title: string }; tabs: { id, label, cta, resourceIds }[] }`.

- [ ] **Step 1: Write the form**

Create `src/components/admin/about-sections/resources-form.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useForm, FormProvider, useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { SectionMeta, SaveBar } from "@/components/admin/section-form-shell";
import { TextField, FieldGrid } from "@/components/admin/form-fields";
import { Switch } from "@/components/ui/switch";
import { useSaveAction } from "@/hooks/use-save-action";
import { saveAboutSection } from "@/app/admin/(dashboard)/about/actions";

type Resource = { id: string; type: string; title: string; slug: string; image: string };
type Tab = { id: string; label: string; cta: { label: string; href: string }; resourceIds: string[] };
type FormValues = { enabled: boolean; heading: { title: string }; tabs: Tab[] };

export function ResourcesForm({
  initialEnabled,
  initialData,
  allResources,
}: {
  initialEnabled: boolean;
  initialData: { heading: { title: string }; tabs: Tab[] };
  allResources: Resource[];
}) {
  const form = useForm<FormValues>({ defaultValues: { enabled: initialEnabled, ...initialData } });
  const { fields } = useFieldArray({ control: form.control, name: "tabs" });
  const { pending, error, success, run } = useSaveAction();

  function onSubmit(values: FormValues) {
    const { enabled, ...data } = values;
    run(async () => {
      try {
        await saveAboutSection("resources", { enabled, data });
        toast.success("Resources section saved");
      } catch (err) {
        toast.error("Failed to save Resources section");
        throw err;
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SectionMeta />
        <TextField label="Heading Title" {...form.register("heading.title")} />

        <div className="space-y-6">
          {fields.map((field, i) => (
            <div key={field.id} className="space-y-4 rounded-lg border border-border p-4">
              <span className="text-sm font-semibold">{form.watch(`tabs.${i}.label`)}</span>
              <FieldGrid>
                <TextField label="Tab Label" {...form.register(`tabs.${i}.label`)} />
                <TextField label="CTA Label" {...form.register(`tabs.${i}.cta.label`)} />
              </FieldGrid>
              <TextField label="CTA Href" {...form.register(`tabs.${i}.cta.href`)} />

              <ResourcePicker tabIndex={i} typeId={field.id} options={allResources.filter((r) => r.type === field.id)} />
            </div>
          ))}
        </div>

        <SaveBar pending={pending} error={error} success={success} />
      </form>
    </FormProvider>
  );
}

function ResourcePicker({ tabIndex, typeId, options }: { tabIndex: number; typeId: string; options: Resource[] }) {
  const form = useFormContext<FormValues>();
  const selected = form.watch(`tabs.${tabIndex}.resourceIds`) ?? [];

  function toggle(id: string, checked: boolean) {
    const current = form.getValues(`tabs.${tabIndex}.resourceIds`) ?? [];
    form.setValue(`tabs.${tabIndex}.resourceIds`, checked ? [...current, id] : current.filter((r) => r !== id));
  }

  return (
    <div className="space-y-1 border-t border-border pt-4">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{typeId.replace("-", " ")}</span>
      <div className="rounded-lg border border-border">
        {options.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">No published resources of this type yet. Add some on the Resources page first.</p>
        )}
        {options.map((resource) => (
          <div key={resource.id} className="flex items-center gap-4 border-b border-border p-4 last:border-b-0">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
              {resource.image && (
                <Image src={resource.image} alt={resource.title} width={40} height={40} className="size-full object-cover" unoptimized />
              )}
            </div>
            <span className="flex-1 truncate text-sm font-medium">{resource.title}</span>
            <Switch checked={selected.includes(resource.id)} onCheckedChange={(v) => toggle(resource.id, v)} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint -- src/components/admin/about-sections/resources-form.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/about-sections/resources-form.tsx
git commit -m "feat: add About resources section admin form"
```

---

### Task 17: `[key]/page.tsx` — wire every form, end-to-end manual verification

**Files:**
- Create: `src/app/admin/(dashboard)/about/[key]/page.tsx`

**Interfaces:**
- Consumes: every form component from Tasks 6-16, `prisma.aboutSection`, `prisma.partner`, `prisma.resource`.

- [ ] **Step 1: Write the page**

Create `src/app/admin/(dashboard)/about/[key]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { HeroForm } from "@/components/admin/about-sections/hero-form";
import { StoryForm } from "@/components/admin/about-sections/story-form";
import { MissionVisionForm } from "@/components/admin/about-sections/mission-vision-form";
import { ValuesForm } from "@/components/admin/about-sections/values-form";
import { JourneyForm } from "@/components/admin/about-sections/journey-form";
import { TrustedCountriesForm } from "@/components/admin/about-sections/trusted-countries-form";
import { ZeroDowntimeCtaForm } from "@/components/admin/about-sections/zero-downtime-cta-form";
import { GrowWithRotexForm } from "@/components/admin/about-sections/grow-with-rotex-form";
import { AchievementsForm } from "@/components/admin/about-sections/achievements-form";
import { GalleryForm } from "@/components/admin/about-sections/gallery-form";
import { ResourcesForm } from "@/components/admin/about-sections/resources-form";

const LABELS: Record<string, string> = {
  hero: "Hero",
  story: "Our Story",
  "mission-vision": "Mission & Vision",
  values: "Values",
  journey: "Journey Timeline",
  "trusted-countries": "Trusted Countries",
  "zero-downtime-cta": "Zero Downtime CTA",
  "grow-with-rotex": "Grow With Rotex",
  achievements: "Achievements",
  gallery: "Gallery",
  resources: "Resources",
};

export default async function AdminAboutSectionPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const section = await prisma.aboutSection.findUnique({ where: { key } });

  if (!section) notFound();

  const meta = { initialEnabled: section.enabled };
  const data = section.data as never;
  const label = LABELS[key] ?? key;

  const allPartners =
    key === "story"
      ? await prisma.partner.findMany({
          where: { published: true },
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, logo: true },
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
          <h1 className="text-2xl font-semibold">{label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edit this About page section.</p>
        </div>
        <Breadcrumb items={[{ label: "About Page", href: "/admin/about" }, { label }]} />
      </div>

      {key === "hero" && <HeroForm {...meta} initialData={data} />}
      {key === "story" && <StoryForm {...meta} initialData={data} allPartners={allPartners} />}
      {key === "mission-vision" && <MissionVisionForm {...meta} initialData={data} />}
      {key === "values" && <ValuesForm {...meta} initialData={data} />}
      {key === "journey" && <JourneyForm {...meta} initialData={data} />}
      {key === "trusted-countries" && <TrustedCountriesForm {...meta} initialData={data} />}
      {key === "zero-downtime-cta" && <ZeroDowntimeCtaForm {...meta} initialData={data} />}
      {key === "grow-with-rotex" && <GrowWithRotexForm {...meta} initialData={data} />}
      {key === "achievements" && <AchievementsForm {...meta} initialData={data} />}
      {key === "gallery" && <GalleryForm {...meta} initialData={data} />}
      {key === "resources" && <ResourcesForm {...meta} initialData={data} allResources={allResources} />}
    </div>
  );
}
```

- [ ] **Step 2: Full lint + build**

Run: `npm run lint`
Expected: zero errors across the whole repo (this task touches the last missing piece, so this is the first point the whole feature type-checks end to end).

Run: `npm run build`
Expected: build succeeds, no type errors in any `about-sections/*` file or the new routes.

- [ ] **Step 3: Manual verification in the browser**

Run: `npm run dev`, log into `/admin/login`, then for each of the 11 keys:
1. Visit `/admin/about/<key>`, confirm the form renders with the seeded content pre-filled (matching Task 2's data).
2. Change one field (e.g. edit the hero title), click "Save changes", confirm the success message appears.
3. Open `/about` in a new tab, confirm the edited content now appears there.
4. Go back to `/admin/about`, toggle that section's switch off, reload `/about`, confirm the section disappears from the page; toggle it back on.

Pay particular attention to:
- `story`: toggling a partner logo on/off actually changes the marquee on `/about`.
- `resources`: picking resources for each tab makes cards appear in the bottom "Resources" section on `/about`; leaving all tabs empty makes the whole section disappear (per the `resourceTabs.length > 0` guard in Task 4).
- `gallery`: uploading an image via "Choose File" shows a preview and, after save, appears in the `/about` gallery swiper.

Stop the dev server once verified.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/\(dashboard\)/about/\[key\]/page.tsx
git commit -m "feat: wire About page CMS admin edit forms"
```

---

## Post-plan note

`prisma/seed-about.ts` is a standalone script (like `prisma/seed-home.ts`), not wired into the default `npm run seed`. If this project's deploy process runs seeds automatically, add a call to it alongside the existing `seed-home`/`seed-content` invocations — check how `prisma/seed.ts` or the deploy pipeline currently invokes `seed-home.ts` before deciding whether `seed-about.ts` needs the same treatment.
