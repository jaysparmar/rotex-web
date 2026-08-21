"use client";

import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";

export function ImportProductsButton() {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="sm" variant="outline" className="gap-1.5">
            <Upload className="size-3.5" />
            Bulk Import
          </Button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => router.push("/admin/products/import")}>
          Variable Product
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          Simple Product
          <DropdownMenuShortcut>Coming soon</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
