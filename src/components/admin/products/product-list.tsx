"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ChevronRight, Trash2, Plus, Layers, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from "@/components/ui/table";
import { AdminPagination } from "@/components/ui/admin-pagination";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { TypeToConfirmDialog } from "@/components/admin/products/type-to-confirm-dialog";
import { ProductFiltersSheet } from "@/components/admin/products/product-filters-sheet";
import { ImportProductsButton } from "@/components/admin/products/import-products-button";
import {
  deleteProduct,
  deleteProducts,
  countProductsByFilter,
  deleteProductsByFilter,
} from "@/app/admin/(dashboard)/products/actions";
import { FILTER_KEYS, type ProductFilterParams } from "@/lib/product-filters";
import { PRODUCT_ATTRIBUTES } from "@/lib/product-constants";
import type { getCompanyCategoryTree, getIndustryTree } from "@/lib/products";

type CompanyOption = Awaited<ReturnType<typeof getCompanyCategoryTree>>[number];
type IndustryOption = Awaited<ReturnType<typeof getIndustryTree>>[number];

type ProductRow = {
  id: string;
  modelNumber: string;
  name: string;
  image: string | null;
  productFamily: string;
  productType: string;
  company: { name: string };
  category: { name: string };
  subCategory: { name: string } | null;
  variantCount: number;
};

type FilterDeleteTarget = { filter: ProductFilterParams; count: number; description: string };

const ATTR_LABEL_BY_KEY = Object.fromEntries(PRODUCT_ATTRIBUTES.map((a) => [a.key, a.label]));

export function ProductList({
  products,
  total,
  page,
  pageSize,
  q,
  filters,
  companies,
  industries,
  attributeValues,
}: {
  products: ProductRow[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
  filters: ProductFilterParams;
  companies: CompanyOption[];
  industries: IndustryOption[];
  attributeValues: Record<string, string[]>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<ProductRow | null>(null);
  const [search, setSearch] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAllAcrossPages, setSelectAllAcrossPages] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [filterDeleteTarget, setFilterDeleteTarget] = useState<FilterDeleteTarget | null>(null);
  const [countingType, setCountingType] = useState<"variable" | "simple" | null>(null);

  if (q !== prevQ) {
    setPrevQ(q);
    setSearch(q);
  }

  const searchKey = `${q}|${page}|${FILTER_KEYS.map((k) => filters[k] ?? "").join("|")}`;
  const [prevSearchKey, setPrevSearchKey] = useState(searchKey);
  if (searchKey !== prevSearchKey) {
    setPrevSearchKey(searchKey);
    setSelectedIds(new Set());
    setSelectAllAcrossPages(false);
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

  const pageIds = products.map((p) => p.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const showSelectAllBanner = allPageSelected && !selectAllAcrossPages && total > products.length;

  function toggleSelectAllOnPage() {
    if (selectAllAcrossPages) {
      setSelectAllAcrossPages(false);
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(allPageSelected ? new Set() : new Set(pageIds));
  }

  function toggleRow(id: string) {
    if (selectAllAcrossPages) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setSelectAllAcrossPages(false);
  }

  function handleDeleteSelected() {
    if (selectAllAcrossPages) {
      setFilterDeleteTarget({
        filter: filters,
        count: total,
        description: `Delete all ${total} product${total === 1 ? "" : "s"} matching the current filters? This also deletes all their variants. This cannot be undone.`,
      });
    } else {
      setBulkDeleteOpen(true);
    }
  }

  function confirmBulkDeleteSelected() {
    const ids = [...selectedIds];
    startTransition(async () => {
      try {
        await deleteProducts(ids);
        toast.success(`${ids.length} product${ids.length === 1 ? "" : "s"} deleted`);
        clearSelection();
      } catch {
        toast.error("Failed to delete selected products");
      }
    });
    setBulkDeleteOpen(false);
  }

  async function openDeleteAllByType(type: "variable" | "simple") {
    setCountingType(type);
    try {
      const filter: ProductFilterParams = { ...filters, productType: type };
      const count = await countProductsByFilter(filter);
      setFilterDeleteTarget({
        filter,
        count,
        description: `Delete all ${count} ${type} product${count === 1 ? "" : "s"} matching the current filters? This also deletes all their variants. This cannot be undone.`,
      });
    } catch {
      toast.error("Failed to count products");
    } finally {
      setCountingType(null);
    }
  }

  function confirmFilterDelete() {
    if (!filterDeleteTarget) return;
    const { filter, count } = filterDeleteTarget;
    startTransition(async () => {
      try {
        await deleteProductsByFilter(filter);
        toast.success(`${count} product${count === 1 ? "" : "s"} deleted`);
        clearSelection();
      } catch {
        toast.error("Failed to delete products");
      }
    });
    setFilterDeleteTarget(null);
  }

  function resolveFilterLabel(key: (typeof FILTER_KEYS)[number], value: string): string {
    switch (key) {
      case "productType":
        return value === "variable" ? "Variable" : "Simple";
      case "companyId":
        return companies.find((c) => c.id === value)?.name ?? value;
      case "categoryId":
        return companies.flatMap((c) => c.categories).find((c) => c.id === value)?.name ?? value;
      case "subCategoryId":
        return (
          companies
            .flatMap((c) => c.categories)
            .flatMap((c) => c.subCategories)
            .find((s) => s.id === value)?.name ?? value
        );
      case "industryId":
        return industries.find((i) => i.id === value)?.name ?? value;
      case "subIndustryId":
        return industries.flatMap((i) => i.subIndustries).find((s) => s.id === value)?.name ?? value;
      default:
        return value;
    }
  }

  function filterFieldLabel(key: (typeof FILTER_KEYS)[number]): string {
    if (key === "productType") return "Type";
    if (key === "productFamily") return "Family";
    if (key === "companyId") return "Company";
    if (key === "categoryId") return "Category";
    if (key === "subCategoryId") return "Sub-Category";
    if (key === "industryId") return "Industry";
    if (key === "subIndustryId") return "Sub-Industry";
    return ATTR_LABEL_BY_KEY[key] ?? key;
  }

  function removeFilter(key: (typeof FILTER_KEYS)[number]) {
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAllFilters() {
    const params = new URLSearchParams(searchParams);
    for (const key of FILTER_KEYS) params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeFilters = FILTER_KEYS.filter((k) => filters[k]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const selectionCount = selectAllAcrossPages ? total : selectedIds.size;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or model number..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setFilterSheetOpen(true)}>
            <SlidersHorizontal className="size-3.5" />
            Filters
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-0.5 px-1.5">
                {activeFilters.length}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button size="sm" variant="outline" className="gap-1.5 text-destructive">
                  <Trash2 className="size-3.5" />
                  Delete All
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled={countingType !== null} onClick={() => openDeleteAllByType("variable")}>
                All Variable Products
              </DropdownMenuItem>
              <DropdownMenuItem disabled={countingType !== null} onClick={() => openDeleteAllByType("simple")}>
                All Simple Products
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ImportProductsButton />
          <Link href="/admin/products/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeFilters.map((key) => (
            <Badge key={key} variant="outline" className="gap-1 pr-1">
              {filterFieldLabel(key)}: {resolveFilterLabel(key, filters[key]!)}
              <button
                type="button"
                className="rounded-full p-0.5 hover:bg-muted"
                onClick={() => removeFilter(key)}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          <button
            type="button"
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            onClick={clearAllFilters}
          >
            Clear all
          </button>
        </div>
      )}

      {selectionCount > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-2">
          <span className="text-sm">
            {selectionCount} product{selectionCount === 1 ? "" : "s"} selected
            {selectAllAcrossPages ? " (all matching filters)" : ""}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear selection
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button size="sm" variant="outline">Bulk options</Button>} />
              <DropdownMenuContent align="end">
                <DropdownMenuItem variant="destructive" onClick={handleDeleteSelected}>
                  Delete selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {showSelectAllBanner && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-sm text-muted-foreground">
          All {products.length} products on this page are selected.
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => setSelectAllAcrossPages(true)}
          >
            Select all {total} matching products
          </button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 pl-4 pr-1">
              <Checkbox
                checked={selectAllAcrossPages || allPageSelected}
                onCheckedChange={toggleSelectAllOnPage}
              />
            </TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Model Number</TableHead>
            <TableHead>Family</TableHead>
            <TableHead>Company / Category / Subcategory</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Variants</TableHead>
            <TableHead className="pr-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 && <TableEmpty colSpan={8}>No products found.</TableEmpty>}
          {products.map((product) => (
            <TableRow key={product.id} hoverable>
              <TableCell className="pl-4 pr-1">
                <Checkbox
                  checked={selectAllAcrossPages || selectedIds.has(product.id)}
                  onCheckedChange={() => toggleRow(product.id)}
                  disabled={selectAllAcrossPages}
                />
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell className="text-muted-foreground">{product.modelNumber}</TableCell>
              <TableCell>
                <Badge variant="outline">{product.productFamily}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {product.company.name} / {product.category.name}
                {product.subCategory ? ` / ${product.subCategory.name}` : ""}
              </TableCell>
              <TableCell className="capitalize text-muted-foreground">{product.productType}</TableCell>
              <TableCell>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Layers className="size-3.5" />
                  {product.variantCount}
                </span>
              </TableCell>
              <TableCell className="pr-4">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AdminPagination page={page} totalPages={totalPages} total={total} itemLabel="product" pageHref={pageHref} />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete product"
        description={`Delete "${toDelete?.name}" (${toDelete?.modelNumber})? This also deletes all its variants. This cannot be undone.`}
        onConfirm={confirmDelete}
        pending={pending}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Delete selected products"
        description={`Delete ${selectedIds.size} selected product${selectedIds.size === 1 ? "" : "s"}? This also deletes all their variants. This cannot be undone.`}
        onConfirm={confirmBulkDeleteSelected}
        pending={pending}
      />

      <TypeToConfirmDialog
        open={filterDeleteTarget !== null}
        onOpenChange={(open) => !open && setFilterDeleteTarget(null)}
        title="Delete products"
        description={filterDeleteTarget?.description ?? ""}
        onConfirm={confirmFilterDelete}
        pending={pending}
      />

      <ProductFiltersSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        filters={filters}
        companies={companies}
        industries={industries}
        attributeValues={attributeValues}
      />
    </div>
  );
}
