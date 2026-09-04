"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AdminNavContent, AdminSidebarLogo } from "@/components/admin/sidebar";

export function MobileSidebarTrigger({ logoLight, logoDark }: { logoLight: string; logoDark: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation menu" />}
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent side="left" className="flex flex-col gap-0 p-0">
        <SheetHeader className="flex h-14 flex-row items-center gap-0 border-b border-border p-0 px-5">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <AdminSidebarLogo logoLight={logoLight} logoDark={logoDark} />
        </SheetHeader>

        <AdminNavContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
