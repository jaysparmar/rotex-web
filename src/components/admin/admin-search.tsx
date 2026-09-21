"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DASHBOARD_ITEM, NAV_ITEMS, PAGE_ITEMS } from "@/components/admin/sidebar";

const SEARCH_ITEMS = [DASHBOARD_ITEM, ...PAGE_ITEMS, ...NAV_ITEMS];

export function AdminSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const goTo = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-9 w-56 justify-start gap-2 px-3 text-sm text-muted-foreground"
      >
        <Search className="size-4" />
        Search pages...
        <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Search pages" description="Jump to any admin page">
        <Command>
          <CommandInput placeholder="Search navigation & pages..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              {SEARCH_ITEMS.map(({ href, label, icon: Icon }) => (
                <CommandItem key={href} value={label} onSelect={() => goTo(href)}>
                  <Icon className="size-4" />
                  {label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
