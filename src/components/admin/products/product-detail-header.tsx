"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteProduct } from "@/app/admin/(dashboard)/products/actions";

export function ProductDetailHeader({
  id,
  name,
  modelNumber,
  slug,
}: {
  id: string;
  name: string;
  modelNumber: string;
  slug: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteProduct(id);
        toast.success(`"${name}" deleted`);
        router.push("/admin/products");
      } catch {
        toast.error("Failed to delete product");
      }
    });
    setConfirmOpen(false);
  }

  return (
    <>
      <Link href={`/product/${slug}`} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="sm" className="gap-1.5">
          <ExternalLink className="size-3.5" />
          View Product
        </Button>
      </Link>

      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-destructive hover:text-destructive"
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2 className="size-3.5" />
        Delete
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete product"
        description={`Delete "${name}" (${modelNumber})? This also deletes all its variants. This cannot be undone.`}
        onConfirm={handleDelete}
        pending={pending}
      />
    </>
  );
}
