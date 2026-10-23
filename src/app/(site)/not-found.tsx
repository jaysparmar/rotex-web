import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SiteNotFound() {
  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center gap-5 px-6 py-24 text-center">
      <p className="text-[clamp(5rem,16vw,9rem)] font-extrabold leading-none tracking-tight text-primary">404</p>

      <div className="space-y-3">
        <h1 className="text-2xl font-semibold sm:text-3xl">Page not found</h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground sm:text-base">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Button nativeButton={false} render={<Link href="/" />}>
          Back to Home
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/products" />}>
          Browse Products
        </Button>
      </div>
    </div>
  );
}
