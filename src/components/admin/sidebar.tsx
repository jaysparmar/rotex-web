"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { LayoutDashboard, Package, Factory, Home, Info, Settings, Handshake, Quote, Mail, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export function AdminSidebar({ logoLight, logoDark }: { logoLight: string; logoDark: string }) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const logo = mounted && resolvedTheme === "light" ? logoLight : logoDark;

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-14 items-center border-b border-border px-5">
        <Image src={logo} alt="Rotex" width={120} height={28} unoptimized className="h-7 w-auto object-contain" priority />
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
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
