"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { GradientButton } from "@/components/ui/gradient-button";
import { Menu } from "lucide-react";
import { IoChevronDownOutline } from "react-icons/io5";
import { SearchIcon } from "@/components/ui/icons";
import { useScrolled } from "@/hooks/use-scrolled";

type CategorySwitcherMenu = PrismaJson.CategorySwitcherMenu;
type FlatMenu = PrismaJson.FlatMenu;
type NavItem = PrismaJson.NavItem;

// Pages not built yet — render as disabled text instead of a broken link.
const DISABLED_HREFS = new Set<string>([]);

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
        {config.categories.map((cat, i) => (
          <button
            key={cat.label}
            onMouseEnter={() => setActiveIdx(i)}
            className={`px-2.5 py-0.5 text-left border-l-2 text-base font-montserrat leading-6 transition-colors ${
              i === activeIdx
                ? "border-[#EF3E23] text-[#EF3E23] font-semibold"
                : "border-transparent text-stone-900 font-medium hover:text-stone-600"
            }`}
          >
            {cat.label}
          </button>
        ))}
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
  const defaultImage =
    config.image ??
    config.columns.flatMap((c) => c.groups).find((g) => g.image)?.image;
  const [hoveredImage, setHoveredImage] = useState<string | undefined>(
    defaultImage,
  );

  return (
    <div
      className="fixed top-20 lg:top-24 left-0 right-0 z-61 bg-white border-b border-stone-300 shadow-lg"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex items-stretch">
        {/* Content columns */}
        <div className="flex gap-10 py-10 container-left-pad">
          {config.columns.map((col, colIdx) => (
            <div
              key={colIdx}
              className={`flex flex-col gap-11 shrink-0${col.className ? ` ${col.className}` : ""}`}
            >
              {col.groups.map((group) => (
                <div
                  key={group.heading}
                  className="flex flex-col gap-2.5"
                  onMouseEnter={() =>
                    group.image && setHoveredImage(group.image)
                  }
                  onMouseLeave={() => setHoveredImage(defaultImage)}
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
        ) : hoveredImage ? (
          <MegaMenuImagePanel
            src={hoveredImage}
            caption={config.imageCaption}
            href={hoveredImage === defaultImage ? config.imageHref : undefined}
            showCaption={hoveredImage === defaultImage}
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

  const className = "w-115 h-87.5 shrink-0 self-start ml-auto relative overflow-hidden block";

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

// ─── Mobile accordion content — mirrors the desktop mega menu panels ──────────

function MobileMegaMenuContent({
  megaMenu,
  onNavigate,
}: {
  megaMenu: PrismaJson.MegaMenuConfig;
  onNavigate: () => void;
}) {
  if (megaMenu.type === "category-switcher") {
    return (
      <div className="flex flex-col gap-4 pl-4 pb-2">
        {megaMenu.categories.map((cat) => (
          <div key={cat.label} className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold font-montserrat uppercase tracking-wide text-white/50">
              {cat.label}
            </span>
            {cat.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className="py-1.5 text-sm font-medium font-montserrat text-white/75 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    );
  }

  const allItems = megaMenu.columns.flatMap((col) => col.groups);

  return (
    <div className="flex flex-col gap-4 pl-4 pb-2">
      {allItems.map((group) => (
        <div key={group.heading} className="flex flex-col gap-1.5">
          {group.href ? (
            <Link
              href={group.href}
              onClick={onNavigate}
              className="text-sm font-semibold font-montserrat text-white hover:text-white/80 transition-colors"
            >
              {group.heading}
            </Link>
          ) : (
            <span className="text-xs font-semibold font-montserrat uppercase tracking-wide text-white/50">
              {group.heading}
            </span>
          )}
          {(group.items ?? group.itemColumns?.flat() ?? []).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="py-1.5 text-sm font-medium font-montserrat text-white/75 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}

export function Navbar({ config }: { config: PrismaJson.GlobalConfigData }) {
  const navItems = config.header.nav.filter((item) => item.enabled);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [heroActive, setHeroActive] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mobileOpenItem, setMobileOpenItem] = useState<string | null>(null);
  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    setMobileOpenItem(null);
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
              <SheetContent
                side="right"
                className="w-72 overflow-y-auto border-white/10"
                style={{ background: "#201D1D" }}
              >
                <div className="flex flex-col gap-1 mt-6 px-2">
                  <Link href={config.logo.href} onClick={closeSheet} className="mb-4">
                    <Image
                      src={config.logo.src}
                      alt={config.logo.alt}
                      width={144}
                      height={28}
                      unoptimized
                      className="w-36 h-8 object-contain"
                    />
                  </Link>
                  {navItems.map((item) =>
                    item.megaMenu ? (
                      <div key={item.id} className="flex flex-col">
                        <button
                          type="button"
                          onClick={() =>
                            setMobileOpenItem((cur) => (cur === item.id ? null : item.id))
                          }
                          className="flex items-center justify-between px-2 py-3 text-sm font-medium font-montserrat text-white/75 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                        >
                          {item.label}
                          <IoChevronDownOutline
                            size={14}
                            className={`text-white/60 transition-transform duration-150 ${
                              mobileOpenItem === item.id ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {mobileOpenItem === item.id && (
                          <MobileMegaMenuContent megaMenu={item.megaMenu} onNavigate={closeSheet} />
                        )}
                      </div>
                    ) : (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={closeSheet}
                        className="flex items-center justify-between px-2 py-3 text-sm font-medium font-montserrat text-white/75 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                      >
                        {item.label}
                      </Link>
                    )
                  )}
                  <div className="mt-4">
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

        {searchOpen && (
          <div
            className="container border-t border-white/10 py-3"
            style={{ background: "#161412" }}
          >
            <input
              autoFocus
              type="text"
              placeholder="Search products, industries, resources..."
              className="w-full bg-transparent text-white placeholder-stone-500 text-sm font-montserrat outline-none"
            />
          </div>
        )}
      </motion.header>

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
