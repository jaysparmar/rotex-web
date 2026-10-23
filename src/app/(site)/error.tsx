"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-semibold sm:text-4xl">Something went wrong</h1>
        <p className="mx-auto max-w-md text-sm text-muted-foreground sm:text-base">
          An unexpected error occurred while loading this page. Please try again.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()}>Try Again</Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}
