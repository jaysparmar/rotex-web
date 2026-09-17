"use client";

import { Bot } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AskAiButton({ config }: { config: PrismaJson.GlobalConfigData["askAi"] }) {
  if (!config?.enabled || !config.iframeUrl) return null;

  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            type="button"
            aria-label={config.label ?? "Ask AI"}
            className="fixed bottom-24 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 sm:bottom-28 sm:right-6"
          />
        }
      >
        <Bot className="size-7" />
      </SheetTrigger>
      <SheetContent side="right" className="w-full p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>{config.label ?? "Ask AI"}</SheetTitle>
        </SheetHeader>
        <iframe
          src={config.iframeUrl}
          title={config.label ?? "Ask AI"}
          className="h-full w-full flex-1 border-0"
        />
      </SheetContent>
    </Sheet>
  );
}
