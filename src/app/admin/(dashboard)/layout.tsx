import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { AdminFooter } from "@/components/admin/footer";
import { Toaster } from "@/components/ui/sonner";

const DEFAULT_ADMIN_CONFIG: PrismaJson.AdminConfigData = {
  sidebarLogoLight: "/logo.svg",
  sidebarLogoDark: "/logo.svg",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const adminConfigRecord = await prisma.adminConfig.findUnique({ where: { id: "admin" } });
  const adminConfig =
    (adminConfigRecord?.data as PrismaJson.AdminConfigData | undefined) ?? DEFAULT_ADMIN_CONFIG;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar logoLight={adminConfig.sidebarLogoLight} logoDark={adminConfig.sidebarLogoDark} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminHeader email={session?.user?.email} />
        <main className="flex-1 p-6">{children}</main>
        <AdminFooter />
      </div>

      <Toaster />
    </div>
  );
}
