
import Link from "next/link";
import Image from "next/image";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { SOCIAL_PLATFORM_MAP } from "@/lib/social-platforms";
import bg from "@/assets/footer_bg.svg";

// Pages not built yet — render as disabled text instead of a broken link.
const DISABLED_HREFS = new Set(["/privacy", "/terms"]);

/* Figma: bg-radial-[at_57%_162%] from-amber-500 via-orange-600 28% to-black 87%
   Origin pulled to 50%: Figma's 57% is near-centre on its 1440px frame, but the
   footer is full-bleed, so 57% pushed the circle right and left the top-right
   corner red while the top-left went black. At 50% both corners sit the same
   distance out and reach black together.
   `ellipse` rather than `circle` so the radii scale with the box — a circle sized
   to the farthest corner overshoots on wide viewports and washes the ramp out. */
const FOOTER_GRADIENT = `
  radial-gradient(
    ellipse at 50% 162%,
    #ff9a00 0%,
    #950000 28%,
    #000000 87%
  )
`.trim();

export function Footer({ config }: { config: PrismaJson.GlobalConfigData }) {
  const { logo, footer } = config;
  const columns = footer.columns.filter(
    (c) => c.enabled !== false && c.links.length > 0
  );

  // Desktop: the trailing four groups pair up into two stacked columns; anything
  // before them stands alone. Slicing from the end survives a hidden lead column.
  const pairCount = Math.min(4, columns.length - (columns.length % 2));
  const leadColumns = columns.slice(0, columns.length - pairCount);
  const stackedPairs: (typeof columns)[] = [];
  for (let i = columns.length - pairCount; i < columns.length; i += 2) {
    stackedPairs.push(columns.slice(i, i + 2));
  }

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: FOOTER_GRADIENT, minHeight: "650px" }}
    >
      {/* Decorative background SVG */}
      <Image
        src={bg.src}
        alt=""
        width={650}
        height={650}
        aria-hidden="true"
        className="absolute pointer-events-none select-none right-0 bottom-0 w-[400px] h-[400px] lg:w-[650px] lg:h-[650px]"
      />

      <div className="container relative z-10 flex flex-col">

        {/* ── MOBILE ── Figma: 320px content block, centred in the viewport */}
        <div className="w-full max-w-80 mx-auto flex flex-col gap-10 pt-16 pb-10 lg:hidden">

          {/* Logo + tagline */}
          <div className="flex flex-col gap-2.5">
            <Link href={logo.href}>
              <Image
                src={logo.src}
                alt={logo.alt}
                width={144}
                height={32}
                priority
                unoptimized
                className="w-36 h-8 object-contain"
              />
            </Link>
            <p className="text-white text-base font-medium font-montserrat leading-6">
              {footer.tagline}
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-10">
            {columns.map((col) => (
              <FooterColumn key={col.id} heading={col.heading} links={col.links} compact />
            ))}
          </div>

          {/* Connect with us */}
          {footer.social.length > 0 && (
            <div className="flex flex-col gap-5">
              <p className="opacity-50 text-white text-base font-semibold font-montserrat leading-5">
                Connect With Us
              </p>
              <div className="flex justify-start items-center gap-2">
                {footer.social.map((s) => (
                  <SocialIcon key={s.id} href={s.href} platform={s.platform} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── DESKTOP ── */}
        <div className="hidden lg:flex flex-col">

          {/* Logo + tagline */}
          <div className="pt-30 flex flex-col gap-4">
            <Link href={logo.href}>
              <Image
                src={logo.src}
                alt={logo.alt}
                width={192}
                height={40}
                priority
                unoptimized
                className="w-48 h-10 object-contain"
              />
            </Link>
            <p className="text-white text-base font-medium font-montserrat leading-6">
              {footer.tagline}
            </p>
          </div>

          {/* Link columns — Figma pairs the last four groups into two stacked
              columns (Company over Join Us, Resources over Stay Informed) and
              leaves everything before them as single columns. Counting from the
              end keeps that shape when a leading column (e.g. Products) is
              hidden for having no links. */}
          <div className="mt-20 pb-10 flex justify-between items-start gap-8">
            {leadColumns.map((col) => (
              <FooterColumn key={col.id} heading={col.heading} links={col.links} />
            ))}

            {stackedPairs.map((pair, i) => (
              <div key={pair[0]?.id ?? i} className="flex flex-col items-start gap-10">
                {pair.map((col) => (
                  <FooterColumn key={col.id} heading={col.heading} links={col.links} />
                ))}
              </div>
            ))}

            {footer.social.length > 0 && (
              <div className="flex flex-col justify-start items-start gap-5 shrink-0">
                <p className="opacity-50 text-white text-base font-semibold font-montserrat leading-5">
                  Connect With Us
                </p>
                <div className="flex justify-start items-center gap-2">
                  {footer.social.map((s) => (
                    <SocialIcon key={s.id} href={s.href} platform={s.platform} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legal */}
        {(footer.legal.copyright || footer.legal.links.length > 0) && (
          <div className="flex flex-col gap-3 border-t border-white/10 py-6 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-subtext text-xs font-medium font-montserrat">{footer.legal.copyright}</p>
            {footer.legal.links.length > 0 && (
              <div className="flex items-center gap-4">
                {footer.legal.links.map((l) =>
                  DISABLED_HREFS.has(l.href) ? (
                    <span key={l.href} className="text-stone-500 text-xs font-medium font-montserrat cursor-not-allowed">
                      {l.label}
                    </span>
                  ) : (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="text-subtext text-xs font-medium font-montserrat hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}

function FooterColumn({
  heading,
  links,
  compact,
}: {
  heading: string;
  links: { label: string; href: string }[];
  compact?: boolean;
}) {
  if (links.length === 0) return null;
  return (
    // Figma: 14px between a column heading and its links on mobile
    <div className={cn("flex flex-col justify-start items-start", compact ? "gap-3.5" : "gap-5")}>
      <p className="opacity-50 text-white text-base font-medium font-montserrat leading-6">
        {heading}
      </p>
      <div className={compact ? "flex flex-col justify-start items-start gap-1.5" : "flex flex-col justify-start items-start gap-2"}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-stone-100 font-medium font-montserrat hover:opacity-70 transition-opacity duration-150",
              compact ? "text-sm leading-6" : "text-base leading-6"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function SocialIcon({ href, platform }: { href: string; platform: string }) {
  const Icon = SOCIAL_PLATFORM_MAP[platform.toLowerCase()]?.icon;
  return (
    <a
      href={href}
      aria-label={platform}
      className="size-7 flex items-center justify-center text-white hover:opacity-70 transition-opacity duration-150"
    >
      {Icon ? <Icon size={24} /> : <Globe size={24} />}
    </a>
  );
}
