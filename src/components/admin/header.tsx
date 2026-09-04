"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { MobileSidebarTrigger } from "@/components/admin/mobile-sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuLinkItem,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function AdminHeader({
  email,
  logoLight,
  logoDark,
}: {
  email?: string | null;
  logoLight: string;
  logoDark: string;
}) {
  const initial = email?.[0]?.toUpperCase() ?? "A";

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <MobileSidebarTrigger logoLight={logoLight} logoDark={logoDark} />

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-2 py-1 text-sm outline-none transition-colors hover:bg-accent">
            <Avatar size="sm">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground">{email}</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLinkItem render={<Link href="/admin/profile" />}>
              <User />
              Profile
            </DropdownMenuLinkItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => signOut({ callbackUrl: "/admin/login" })}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
