"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { GradientButton } from "@/components/ui/gradient-button";
import { Menu, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { IoChevronDownOutline } from "react-icons/io5";
import { SearchIcon } from "@/components/ui/icons";
import { SearchModal } from "@/components/layout/search-modal";
import { useScrolled } from "@/hooks/use-scrolled";

type CategorySwitcherMenu = PrismaJson.CategorySwitcherMenu;
type FlatMenu = PrismaJson.FlatMenu;
type NavItem = PrismaJson.NavItem;

// Pages not built yet — render as disabled text instead of a broken link.
const DISABLED_HREFS = new Set<string>([]);

// A category-switcher category (e.g. "Oil & Gas") only lists its sub-items
// (Upstream/Midstream/Downstream) — there was no way to click through to the
// industry's own landing page, only straight into a sub-industry. Falls back
// to deriving "/industries/oil-gas" from a sub-item's "/industries/oil-gas/upstream"
// href when the CMS hasn't set an explicit viewAllHref.
function categorySwitcherHref(cat: PrismaJson.MegaMenuCategory): string | undefined {
  if (cat.viewAllHref) return cat.viewAllHref;
  const firstHref = cat.items[0]?.href;
  if (!firstHref) return undefined;
  const segments = firstHref.split("/");
  return segments.length > 3 ? segments.slice(0, 3).join("/") : firstHref;
}

function chunk<T>(items: T[], size: number): T[][] {
  if (items.length <= size) return [items];
  const columnCount = Math.ceil(items.length / size);
  const perColumn = Math.ceil(items.length / columnCount);
  const columns: T[][] = [];
  for (let i = 0; i < items.length; i += perColumn) {
    columns.push(items.slice(i, i + perColumn));
  }
  return columns;
}

// ─── Category Switcher Panel (Products) ──────────────────────────────────────

function CategorySwitcherPanel({
  config,
  onMouseEnter,
  onMouseLeave,
  onClose,
}: {
  config: CategorySwitcherMenu;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = config.categories[activeIdx];

  return (
    <div
      className="fixed top-20 lg:top-24 left-0 right-0 z-61 bg-white border-b border-stone-300 shadow-lg flex"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Left: Category list */}
      <div className="w-72 bg-stone-100 border-r border-stone-300 px-10 py-10 flex flex-col gap-4 shrink-0">
        {config.categories.map((cat, i) => {
          const href = categorySwitcherHref(cat);
          return (
            <Link
              key={cat.label}
              href={href ?? "#"}
              onMouseEnter={() => setActiveIdx(i)}
              onClick={onClose}
              className={`px-2.5 py-0.5 text-left border-l-2 text-base font-montserrat leading-6 transition-colors ${
                i === activeIdx
                  ? "border-[#EF3E23] text-[#EF3E23] font-semibold"
                  : "border-transparent text-stone-900 font-medium hover:text-stone-600"
              }`}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>

      {/* Middle: Sub-items */}
      <div className="flex-1 border-r border-stone-300 px-10 py-10 flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          {active.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="group w-64 flex flex-col gap-1"
            >
              <span className="text-stone-900 text-base font-medium font-montserrat leading-6 group-hover:text-[#EF3E23] transition-colors">
                {item.label}
              </span>
              <span className="text-neutral-400 text-xs font-medium font-montserrat leading-5">
                {item.description}
              </span>
            </Link>
          ))}
        </div>
        {active.viewAllLabel && (
          <Link
            href={active.viewAllHref ?? "#"}
            onClick={onClose}
            className="text-[#EF3E23] text-sm font-medium font-montserrat leading-5 hover:underline"
          >
            {active.viewAllLabel}
          </Link>
        )}
      </div>

      {/* Right: CTA */}
      <Link
        href={config.cta.href}
        onClick={onClose}
        className="w-96 shrink-0 px-10 py-10 flex flex-col justify-end bg-gradient-mega-cta"
      >
        <div className="flex items-end gap-4">
          <span className="text-white text-2xl font-medium font-montserrat leading-8 flex-1">
            {config.cta.text}
          </span>
          <IoChevronDownOutline
            className="-rotate-90 text-white shrink-0"
            size={24}
          />
        </div>
      </Link>
    </div>
  );
}

// ─── Flat Panel (Industries) ──────────────────────────────────────────────────

function FlatMegaMenuPanel({
  config,
  onMouseEnter,
  onMouseLeave,
  onClose,
}: {
  config: FlatMenu;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}) {
  type PanelState = { image?: string; caption?: string; href?: string };
  // Before any hover, default to the featured blog's image (resolved server-side onto the
  // Blogs card). Only falls back to the admin's static default image if no blog is featured.
  const blogsGroup = config.columns.flatMap((c) => c.groups).find((g) => g.href === "/blogs");
  const defaultPanel: PanelState = blogsGroup?.image
    ? { image: blogsGroup.image, caption: blogsGroup.imageCaption, href: blogsGroup.imageHref }
    : { image: config.image, caption: config.imageCaption };
  const [panel, setPanel] = useState<PanelState>(defaultPanel);

  // A column whose heaviest group splits into multiple sub-columns (>6 items,
  // e.g. Process Industries) is roughly twice as wide as a plain one — render
  // those last so the narrow columns before them (e.g. Oil & Gas / Power and
  // Machine Solutions / Automotive / Rail / Aerospace) land adjacent and can
  // share a row instead of each wrapping alone with empty space beside them.
  const isWideColumn = (col: FlatMenu["columns"][number]) =>
    col.groups.some((g) => (g.items?.length ?? 0) > 6 || g.itemColumns);
  const orderedColumns = [...config.columns].sort(
    (a, b) => Number(isWideColumn(a)) - Number(isWideColumn(b))
  );

  return (
    <div
      className="fixed top-20 lg:top-24 left-0 right-0 z-61 bg-white border-b border-stone-300 shadow-lg"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex items-stretch">
        {/* Content columns — flex-1/min-w-0 so this takes only the space left over
            after the fixed-size image panel, and flex-wrap so a column that doesn't
            fit on the first row (e.g. Case Studies, or Machine Solutions/Automotive/
            Rail/Aerospace once Process Industries grows) drops to the next row
            instead of overlapping the image. */}
        <div className="flex flex-wrap gap-x-10 gap-y-6 py-10 container-left-pad flex-1 min-w-0">
          {orderedColumns.map((col, colIdx) => (
            <div
              key={colIdx}
              className={`flex flex-col gap-11 shrink-0 ${col.className ?? "min-w-40 lg:min-w-48"}`}
            >
              {col.groups.map((group) => (
                <div
                  key={group.heading}
                  className="flex flex-col gap-2.5"
                  onMouseEnter={() =>
                    group.image &&
                    setPanel({ image: group.image, caption: group.imageCaption, href: group.imageHref })
                  }
                  onMouseLeave={() => setPanel(defaultPanel)}
                >
                  {/* Heading */}
                  {group.href && DISABLED_HREFS.has(group.href) ? (
                    <span className="text-stone-400 text-base font-semibold font-montserrat leading-6 cursor-not-allowed">
                      {group.heading}{" "}
                      <span className="text-xs font-medium normal-case">
                        (Coming soon)
                      </span>
                    </span>
                  ) : group.href ? (
                    <Link
                      href={group.href}
                      onClick={onClose}
                      className="text-stone-900 text-base font-semibold font-montserrat leading-6 hover:text-[#EF3E23] transition-colors"
                    >
                      {group.heading}
                    </Link>
                  ) : (
                    <span className="text-stone-900 text-base font-semibold font-montserrat leading-6">
                      {group.heading}
                    </span>
                  )}

                  {/* Description (e.g. About Us cards) */}
                  {group.description && (
                    <p className="text-stone-500 text-sm font-medium font-montserrat leading-5">
                      {group.description}
                    </p>
                  )}

                  {/* Flat items — split into sub-columns of max 6 when the list runs long */}
                  {group.items && group.items.length > 0 && (
                    <div className="flex gap-8">
                      {chunk(group.items, 6).map((col, colIdx) => (
                        <div key={colIdx} className="flex flex-col gap-2">
                          {col.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={onClose}
                              className="text-stone-500 text-base font-medium font-montserrat leading-6 hover:text-stone-900 transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Two sub-columns (e.g. Process Industries) */}
                  {group.itemColumns && (
                    <div className="flex gap-8">
                      {group.itemColumns.map((subCol, i) => (
                        <div key={i} className="flex flex-col gap-2">
                          {subCol.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={onClose}
                              className="text-stone-500 text-base font-medium font-montserrat leading-6 hover:text-stone-900 transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Right: CTA gradient or image */}
        {config.cta ? (
          <Link
            href={config.cta.href}
            onClick={onClose}
            className="w-96 shrink-0 min-h-72 ml-auto px-10 py-10 flex flex-col justify-end bg-gradient-mega-cta"
          >
            <div className="flex items-end gap-4">
              <span className="text-white text-2xl font-medium font-montserrat leading-8 flex-1">
                {config.cta.text}
              </span>
              <IoChevronDownOutline
                className="-rotate-90 text-white shrink-0"
                size={24}
              />
            </div>
          </Link>
        ) : panel.image ? (
          <MegaMenuImagePanel
            src={panel.image}
            caption={panel.caption}
            href={panel.href}
            showCaption
            onClose={onClose}
          />
        ) : null}
      </div>
    </div>
  );
}

function MegaMenuImagePanel({
  src,
  caption,
  href,
  showCaption,
  onClose,
}: {
  src: string;
  caption?: string;
  href?: string;
  showCaption: boolean;
  onClose: () => void;
}) {
  const content = (
    <>
      <AnimatePresence mode="sync">
        <motion.div
          key={src}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Image src={src} alt={caption ?? ""} fill className="object-cover" sizes="350px" unoptimized />
        </motion.div>
      </AnimatePresence>
      {caption && showCaption && (
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-5">
          <span className="text-white text-lg font-semibold font-montserrat leading-5">{caption}</span>
        </div>
      )}
    </>
  );

  // Content columns are flex-1/flex-wrap (see FlatMegaMenuPanel) and reflow around
  // whatever width this takes, so it no longer needs to shrink on laptop widths to
  // avoid pushing the dropdown wider than the screen — full size from lg upward.
  // No fixed height and no self-start, so the parent's items-stretch (the
  // default cross-axis behavior) makes this match the content column's full
  // height — including when that content wraps to multiple rows — instead of
  // staying a fixed height and leaving blank space below it once the content
  // grows taller than before.
  const className =
    "w-72 lg:w-115 min-h-54 lg:min-h-87.5 shrink-0 ml-auto relative overflow-hidden block";

  if (href) {
    return (
      <Link href={href} onClick={onClose} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

// ─── Animation constants ──────────────────────────────────────────────────────

const EASE = [0.4, 0, 0.2, 1] as const;
const DURATION = 0.5;
const LOGO_DURATION = 0.6;

// ─── Floating Logo ────────────────────────────────────────────────────────────

function FloatingLogo({
  scrolled,
  logo,
}: {
  scrolled: boolean;
  logo: { src: string; alt: string; href: string };
}) {
  return (
    <motion.div
      className="fixed left-0 right-0 pointer-events-none hidden lg:block"
      style={{ zIndex: 60 }}
      initial={false}
      animate={{ top: scrolled ? 32 : 112 }}
      transition={{ duration: LOGO_DURATION, ease: EASE }}
    >
      <div className="container">
        <Link href={logo.href} className="pointer-events-auto inline-block">
          <motion.div
            className="overflow-hidden"
            initial={false}
            animate={{
              width: scrolled ? 144 : 282,
              height: scrolled ? 31 : 60,
            }}
            transition={{ duration: LOGO_DURATION, ease: EASE }}
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={282}
              height={60}
              priority
              unoptimized
              className="w-full h-full object-contain object-left"
            />
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

// ─── Mobile drill-down panel — replaces the root list with a "< Back" screen ──

function MobileBackRow({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="flex items-center gap-1 py-3 text-sm font-medium font-montserrat text-stone-900"
    >
      <ChevronLeft size={16} />
      Back
    </button>
  );
}

function MobileDrillRow({
  href,
  label,
  description,
  onClick,
}: {
  href: string;
  label: string;
  description?: string;
  onClick: () => void;
}) {
  if (description) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="flex flex-col gap-0.5 py-3 border-b border-neutral-200 last:border-b-0"
      >
        <span className="text-sm font-medium font-montserrat text-stone-900">{label}</span>
        <span className="text-xs font-medium font-montserrat text-stone-500">{description}</span>
      </Link>
    );
  }
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between py-3 border-b border-neutral-200 last:border-b-0"
    >
      <span className="text-base font-medium font-montserrat text-stone-900">{label}</span>
      <Plus size={16} className="shrink-0 text-[#EF3E23]" />
    </Link>
  );
}

function MobileMegaMenuContent({
  megaMenu,
  onNavigate,
  onBack,
}: {
  megaMenu: PrismaJson.MegaMenuConfig;
  onNavigate: () => void;
  onBack: () => void;
}) {
  const [categoryIdx, setCategoryIdx] = useState<number | null>(null);

  if (megaMenu.type === "category-switcher") {
    if (categoryIdx !== null) {
      const category = megaMenu.categories[categoryIdx];
      const viewAllHref = categorySwitcherHref(category);
      return (
        <div className="flex flex-col">
          <MobileBackRow onBack={() => setCategoryIdx(null)} />
          <div className="flex flex-col">
            {viewAllHref && (
              <MobileDrillRow
                key={viewAllHref}
                href={viewAllHref}
                label={category.viewAllLabel || `All ${category.label}`}
                onClick={onNavigate}
              />
            )}
            {category.items.map((item) => (
              <MobileDrillRow
                key={item.href}
                href={item.href}
                label={item.label}
                description={item.description}
                onClick={onNavigate}
              />
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col">
        <MobileBackRow onBack={onBack} />
        <div className="flex flex-col">
          {megaMenu.categories.map((cat, i) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => setCategoryIdx(i)}
              className="flex items-center justify-between py-3 border-b border-neutral-200 last:border-b-0"
            >
              <span className="text-base font-medium font-montserrat text-stone-900">{cat.label}</span>
              <Plus size={16} className="shrink-0 text-[#EF3E23]" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  const allItems = megaMenu.columns.flatMap((col) => col.groups);

  return (
    <div className="flex flex-col">
      <MobileBackRow onBack={onBack} />
      <div className="flex flex-col">
        {allItems.map((group) =>
          group.href ? (
            <MobileDrillRow
              key={group.heading}
              href={group.href}
              label={group.heading}
              description={group.description}
              onClick={onNavigate}
            />
          ) : (
            <div key={group.heading} className="flex flex-col gap-1.5 py-3 border-b border-neutral-200 last:border-b-0">
              <span className="text-xs font-semibold font-montserrat uppercase tracking-wide text-stone-500">
                {group.heading}
              </span>
              {(group.items ?? group.itemColumns?.flat() ?? []).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className="py-1.5 text-sm font-medium font-montserrat text-stone-900"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export function Navbar({ config }: { config: PrismaJson.GlobalConfigData }) {
  const navItems = config.header.nav.filter((item) => item.enabled);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [heroActive, setHeroActive] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mobileNavItem, setMobileNavItem] = useState<NavItem | null>(null);
  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    setMobileNavItem(null);
  }, []);
  const scrolled = useScrolled(60);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // No hero slides to sit on top of → header can't be transparent, must render solid.
  useEffect(() => {
    if (!isHome) return;
    let cancelled = false;
    fetch("/api/v1/home/hero", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        const slides = json?.data?.slides;
        setHeroActive(
          Boolean(json?.data?.enabled) &&
            Boolean(json?.data?.isFirst) &&
            Array.isArray(slides) &&
            slides.length > 0,
        );
      })
      .catch(() => {
        if (!cancelled) setHeroActive(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isHome]);

  const transparent = isHome && heroActive;

  const openMenu = useCallback((label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(label);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 150);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const closeMenu = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(null);
  }, []);

  // The desktop dropdown has no responsive hide of its own — if the viewport shrinks below
  // `lg` (e.g. resizing the window) while it's open, it'd otherwise stay stuck on top of the
  // mobile layout since only the hover triggers that open it are `hidden lg:flex`.
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) closeMenu();
    };
    handleChange(mql);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [closeMenu]);

  const activeItem = navItems.find((item) => item.id === activeMenu);

  return (
    <>
      {transparent && <FloatingLogo scrolled={scrolled} logo={config.logo} />}

      <motion.header
        className="fixed top-0 left-0 right-0 z-50"
        initial={false}
        animate={{
          backgroundColor:
            !transparent || scrolled ? "#201D1D" : "rgba(13,13,13,0)",
        }}
        transition={{ duration: DURATION, ease: EASE }}
      >
        <div className="container h-20 lg:h-24 flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center">
            <Link href={config.logo.href} className="lg:hidden">
              <Image
                src={config.logo.src}
                alt={config.logo.alt}
                width={96}
                height={20}
                unoptimized
                className="w-24 h-5 object-contain"
              />
            </Link>

            {transparent ? (
              <motion.div
                className="shrink-0 hidden lg:block"
                initial={false}
                animate={{ width: scrolled ? 168 : 0 }}
                transition={{ duration: LOGO_DURATION, ease: EASE }}
              />
            ) : (
              <Link
                href={config.logo.href}
                className="hidden lg:flex items-center mr-6"
              >
                <Image
                  src={config.logo.src}
                  alt={config.logo.alt}
                  width={144}
                  height={31}
                  unoptimized
                  className="w-36 h-8 object-contain"
                />
              </Link>
            )}

            <div className="hidden lg:flex items-center gap-6">
              {navItems.map((item) => (
                <div
                  key={item.id}
                  onMouseEnter={() =>
                    item.megaMenu ? openMenu(item.id) : scheduleClose()
                  }
                  onMouseLeave={scheduleClose}
                >
                  {item.megaMenu ? (
                    <span className="flex items-center gap-0.5 group cursor-default select-none">
                      <span
                        className={`text-sm font-medium font-montserrat whitespace-nowrap transition-colors duration-150 ${
                          activeMenu === item.id
                            ? "text-white"
                            : "text-stone-300 group-hover:text-white"
                        }`}
                      >
                        {item.label}
                      </span>
                      <IoChevronDownOutline
                        size={14}
                        className={`transition-all duration-150 shrink-0 ${
                          activeMenu === item.id
                            ? "text-white rotate-180"
                            : "text-stone-300 group-hover:text-white"
                        }`}
                      />
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex items-center gap-0.5 group"
                    >
                      <span
                        className={`text-sm font-medium font-montserrat whitespace-nowrap transition-colors duration-150 ${
                          activeMenu === item.id
                            ? "text-white"
                            : "text-stone-300 group-hover:text-white"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="hidden lg:flex items-center gap-6 shrink-0">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="focus:outline-none text-white/80 hover:text-white transition-colors duration-150"
              aria-label="Search"
            >
              <SearchIcon size={22} />
            </button>
            <GradientButton href={config.header.cta.href}>
              {config.header.cta.label}
            </GradientButton>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="focus:outline-none text-white/80 hover:text-white transition-colors duration-150"
              aria-label="Search"
            >
              <SearchIcon size={22} />
            </button>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger
                render={
                  <button className="text-white/80 hover:text-white transition-colors" />
                }
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[90%] max-w-96 overflow-y-auto bg-white" showCloseButton={false}>
                <div className="flex h-full flex-col gap-1 px-5">
                  {mobileNavItem?.megaMenu ? (
                    <MobileMegaMenuContent
                      key={mobileNavItem.id}
                      megaMenu={mobileNavItem.megaMenu}
                      onNavigate={closeSheet}
                      onBack={() => setMobileNavItem(null)}
                    />
                  ) : (
                    <div className="flex flex-col">
                      {navItems.map((item) =>
                        item.megaMenu ? (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setMobileNavItem(item)}
                            className="flex items-center justify-between py-3 border-b border-neutral-200 last:border-b-0"
                          >
                            <span className="text-base font-medium font-montserrat text-stone-900">
                              {item.label}
                            </span>
                            <ChevronRight size={16} className="shrink-0 text-stone-900" />
                          </button>
                        ) : (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={closeSheet}
                            className="flex items-center py-3 border-b border-neutral-200 last:border-b-0"
                          >
                            <span className="text-base font-medium font-montserrat text-stone-900">
                              {item.label}
                            </span>
                          </Link>
                        )
                      )}
                    </div>
                  )}
                  <div className="mt-auto pb-6">
                    <GradientButton
                      href={config.header.cta.href}
                      className="w-full"
                      onClick={closeSheet}
                    >
                      {config.header.cta.label}
                    </GradientButton>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

      </motion.header>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Mega Menu */}
      <AnimatePresence>
        {activeMenu && activeItem?.megaMenu && (
          <motion.div
            key={activeMenu}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {activeItem.megaMenu.type === "category-switcher" ? (
              <CategorySwitcherPanel
                config={activeItem.megaMenu}
                onMouseEnter={cancelClose}
                onMouseLeave={scheduleClose}
                onClose={closeMenu}
              />
            ) : (
              <FlatMegaMenuPanel
                config={activeItem.megaMenu}
                onMouseEnter={cancelClose}
                onMouseLeave={scheduleClose}
                onClose={closeMenu}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
