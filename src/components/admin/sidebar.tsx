"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Package,
  Factory,
  Home,
  Info,
  Settings,
  Handshake,
  Quote,
  Mail,
  BookOpen,
  Globe,
  Award,
  Phone,
  Layers,
  ChevronDown,
  Images,
  Briefcase,
  Truck,
  FileText,
  Download,
  Wrench,
  Shield,
  Building2,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PAGE_ITEMS = [
  { href: "/admin/home", label: "Home Page", icon: Home },
  { href: "/admin/about", label: "About Page", icon: Info },
  { href: "/admin/contact", label: "Contact Page", icon: Phone },
  { href: "/admin/channel-partner", label: "Channel Partner Page", icon: Handshake },
  { href: "/admin/career", label: "Career Page", icon: Briefcase },
  { href: "/admin/supplier", label: "Supplier Page", icon: Truck },
  { href: "/admin/partner-sales-tools", label: "Partner Sales Tools", icon: Wrench },
  { href: "/admin/legal", label: "Legal Pages", icon: Shield },
];

const NAV_ITEMS = [
  { href: "/admin/media", label: "Media Library", icon: Images },
  { href: "/admin/awards", label: "Awards", icon: Award },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/attributes", label: "Attributes", icon: SlidersHorizontal },
  { href: "/admin/companies", label: "Companies", icon: Building2 },
  { href: "/admin/industries", label: "Industries", icon: Factory },
  { href: "/admin/partners", label: "Partners", icon: Handshake },
  { href: "/admin/certifications", label: "Certifications", icon: Award },
  { href: "/admin/countries", label: "Countries", icon: Globe },
  { href: "/admin/job-postings", label: "Job Postings", icon: Briefcase },
  { href: "/admin/job-applications", label: "Job Applications", icon: FileText },
  { href: "/admin/downloads", label: "Downloads", icon: Download },
  { href: "/admin/customer-stories", label: "Customer Stories", icon: Quote },
  { href: "/admin/resources", label: "Resources", icon: BookOpen },
  { href: "/admin/enquiries", label: "Enquiries", icon: Mail },
  { href: "/admin/global", label: "Global Config", icon: Settings },
];

export function AdminSidebar({ logoLight, logoDark }: { logoLight: string; logoDark: string }) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pagesActive = PAGE_ITEMS.some(({ href }) => pathname.startsWith(href));
  const [pagesOpen, setPagesOpen] = useState(pagesActive);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (pagesActive) setPagesOpen(true);
  }, [pagesActive]);

  const logo = mounted && resolvedTheme === "light" ? logoLight : logoDark;

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-14 items-center border-b border-border px-5">
        <Image src={logo} alt="Rotex" width={120} height={28} unoptimized className="h-7 w-auto object-contain" priority />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <Link href="/admin" className="block">
          <Button
            variant={pathname === "/admin" ? "secondary" : "ghost"}
            className="h-9 w-full justify-start gap-3 px-3 text-sm font-medium"
          >
            <LayoutDashboard className="size-4" />
            Dashboard
          </Button>
        </Link>

        <div>
          <Button
            variant={pagesActive && !pagesOpen ? "secondary" : "ghost"}
            onClick={() => setPagesOpen((v) => !v)}
            className="h-9 w-full justify-start gap-3 px-3 text-sm font-medium"
          >
            <Layers className="size-4" />
            Pages
            <ChevronDown className={cn("ml-auto size-3.5 transition-transform", pagesOpen && "rotate-180")} />
          </Button>
          {pagesOpen && (
            <div className="mt-1 space-y-1 border-l border-border pl-3">
              {PAGE_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link key={href} href={href} className="block">
                    <Button
                      variant={active ? "secondary" : "ghost"}
                      className="h-9 w-full justify-start gap-3 px-3 text-sm font-medium"
                    >
                      <Icon className="size-4" />
                      {label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className="block">
              <Button
                variant={active ? "secondary" : "ghost"}
                className="h-9 w-full justify-start gap-3 px-3 text-sm font-medium"
              >
                <Icon className="size-4" />
                {label}
              </Button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
