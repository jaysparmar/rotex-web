"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ChevronRight, Trash2, Plus, Layers, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ImportProductsButton } from "@/components/admin/products/import-products-button";
import { deleteProduct } from "@/app/admin/(dashboard)/products/actions";

type ProductRow = {
  id: string;
  modelNumber: string;
  name: string;
  image: string | null;
  productFamily: string;
  productType: string;
  company: { name: string };
  category: { name: string };
  variantCount: number;
};

export function ProductList({
  products,
  total,
  page,
  pageSize,
  q,
}: {
  products: ProductRow[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<ProductRow | null>(null);
  const [search, setSearch] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  if (q !== prevQ) {
    setPrevQ(q);
    setSearch(q);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (value) params.set("q", value);
      else params.delete("q");
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    }, 350);
  }

  function pageHref(nextPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    return `${pathname}?${params.toString()}`;
  }

  function confirmDelete() {
    if (!toDelete) return;
    const name = toDelete.name;
    startTransition(async () => {
      try {
        await deleteProduct(toDelete.id);
        toast.success(`"${name}" deleted`);
      } catch {
        toast.error(`Failed to delete "${name}"`);
      }
    });
    setToDelete(null);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or model number..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-9 pl-8"
          />
        </div>

        <div className="flex items-center gap-2">
          <ImportProductsButton />
          <Link href="/admin/products/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2.5 pl-4 pr-3 font-medium">Product</th>
              <th className="py-2.5 pr-3 font-medium">Model Number</th>
              <th className="py-2.5 pr-3 font-medium">Family</th>
              <th className="py-2.5 pr-3 font-medium">Company / Category</th>
              <th className="py-2.5 pr-3 font-medium">Type</th>
              <th className="py-2.5 pr-3 font-medium">Variants</th>
              <th className="py-2.5 pr-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  No products found.
                </td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="transition-colors hover:bg-muted/20">
                <td className="py-2.5 pl-4 pr-3">
                  <Link href={`/admin/products/${product.id}`} className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
                      {product.image && (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={36}
                          height={36}
                          className="size-full object-contain"
                          unoptimized
                        />
                      )}
                    </div>
                    <span className="font-medium hover:underline">{product.name}</span>
                  </Link>
                </td>
                <td className="py-2.5 pr-3 text-muted-foreground">{product.modelNumber}</td>
                <td className="py-2.5 pr-3">
                  <Badge variant="outline">{product.productFamily}</Badge>
                </td>
                <td className="py-2.5 pr-3 text-muted-foreground">
                  {product.company.name} / {product.category.name}
                </td>
                <td className="py-2.5 pr-3 capitalize text-muted-foreground">{product.productType}</td>
                <td className="py-2.5 pr-3">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Layers className="size-3.5" />
                    {product.variantCount}
                  </span>
                </td>
                <td className="py-2.5 pr-4">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/products/${product.id}`}>
                      <Button variant="ghost" size="icon-sm">
                        <ChevronRight className="size-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={pending}
                      onClick={() => setToDelete(product)}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {total} product{total === 1 ? "" : "s"} · Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <Link href={pageHref(Math.max(1, page - 1))} aria-disabled={page <= 1}>
            <Button variant="outline" size="sm" disabled={page <= 1}>
              Previous
            </Button>
          </Link>
          <Link href={pageHref(Math.min(totalPages, page + 1))} aria-disabled={page >= totalPages}>
            <Button variant="outline" size="sm" disabled={page >= totalPages}>
              Next
            </Button>
          </Link>
        </div>
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete product"
        description={`Delete "${toDelete?.name}" (${toDelete?.modelNumber})? This also deletes all its variants. This cannot be undone.`}
        onConfirm={confirmDelete}
        pending={pending}
      />
    </div>
  );
}
