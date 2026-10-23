import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-[clamp(3.5rem,10vw,5.5rem)] font-extrabold leading-none tracking-tight text-primary">404</p>

      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="text-sm text-muted-foreground">This admin page doesn&apos;t exist or may have moved.</p>
      </div>

      <Button size="sm" className="mt-2" nativeButton={false} render={<Link href="/admin" />}>
        Back to Dashboard
      </Button>
    </div>
  );
}
