import Link from "next/link";
import { PanelTop, PanelBottom, LayoutPanelLeft, MessageCircle, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/admin/breadcrumb";

const SECTIONS = [
  {
    key: "header",
    label: "Header",
    description: "Logo, navigation items, mega menus, and the header CTA button.",
    icon: PanelTop,
  },
  {
    key: "footer",
    label: "Footer",
    description: "Tagline, link columns, social links, legal, and contact info.",
    icon: PanelBottom,
  },
  {
    key: "admin",
    label: "Admin Panel",
    description: "Sidebar logo for the admin panel itself — separate light and dark theme images.",
    icon: LayoutPanelLeft,
  },
  {
    key: "whatsapp",
    label: "WhatsApp Button",
    description: "Floating WhatsApp button shown in the bottom-right corner of every public page.",
    icon: MessageCircle,
  },
  {
    key: "ask-ai",
    label: "Ask AI Button",
    description: "Floating Ask AI button that opens an iframe panel on every public page.",
    icon: Bot,
  },
];

export default function AdminGlobalConfigPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Global Config</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Site-wide header and footer content shown on every page.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Global Config" }]} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link key={section.key} href={`/admin/global/${section.key}`}>
            <Card className="h-full transition-colors hover:border-foreground/30">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <section.icon className="size-5" />
                </div>
                <div>
                  <p className="text-base font-semibold">{section.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
