import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Package,
  Factory,
  Mail,
  Briefcase,
  FileText,
  Search,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Globe,
  ShieldCheck,
  Handshake,
  Image as ImageIcon,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { SEO_PAGES, type SeoMetaData } from "@/lib/seo";
import { cn } from "@/lib/utils";

const DAY_MS = 24 * 60 * 60 * 1000;

const SOURCE_LABEL: Record<string, string> = {
  contact: "Contact",
  industry: "Industry",
  supplier: "Supplier",
  "channel-partner": "Channel Partner",
};

export default async function AdminDashboardPage() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
  const prevWeekAgo = new Date(now.getTime() - 14 * DAY_MS);

  const [
    productCount,
    industryCount,
    categoryCount,
    subIndustryCount,
    resourceCount,
    partnerCount,
    certificationCount,
    countryCount,
    mediaCount,
    enquiriesThisWeek,
    enquiriesPrevWeek,
    applicationsThisWeek,
    resourcesPublished,
    resourcesDraft,
    jobPostingsLive,
    jobPostingsDraft,
    productsMissingDescription,
    seoPageRows,
    recentEnquiries,
    topCategories,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.industry.count(),
    prisma.category.count(),
    prisma.subIndustry.count(),
    prisma.resource.count(),
    prisma.partner.count(),
    prisma.certification.count(),
    prisma.country.count(),
    prisma.mediaAsset.count(),
    prisma.enquiry.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.enquiry.count({ where: { createdAt: { gte: prevWeekAgo, lt: weekAgo } } }),
    prisma.jobApplication.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.resource.count({ where: { published: true } }),
    prisma.resource.count({ where: { published: false } }),
    prisma.jobPosting.count({ where: { published: true } }),
    prisma.jobPosting.count({ where: { published: false } }),
    prisma.product.count({ where: { productType: "simple", description: null } }),
    prisma.seoPage.findMany({ select: { data: true } }),
    prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.category.findMany({
      select: { name: true, _count: { select: { products: true } } },
      orderBy: { products: { _count: "desc" } },
    }),
  ]);

  const seoConfigured = seoPageRows.filter((r) => (r.data as SeoMetaData)?.title?.trim()).length;
  const seoTotal = SEO_PAGES.length + productCount + categoryCount + industryCount + subIndustryCount + resourceCount;
  const seoMissing = Math.max(0, seoTotal - seoConfigured);

  const needsAttention = [
    seoMissing > 0 && {
      label: `${seoMissing} page${seoMissing === 1 ? "" : "s"} missing SEO meta`,
      href: "/admin/seo",
      icon: Search,
    },
    resourcesDraft > 0 && {
      label: `${resourcesDraft} resource${resourcesDraft === 1 ? "" : "s"} still in draft`,
      href: "/admin/resources?published=false",
      icon: FileText,
    },
    productsMissingDescription > 0 && {
      label: `${productsMissingDescription} product${productsMissingDescription === 1 ? "" : "s"} missing a short description`,
      href: "/admin/products",
      icon: Package,
    },
    jobPostingsDraft > 0 && {
      label: `${jobPostingsDraft} job posting${jobPostingsDraft === 1 ? "" : "s"} unpublished`,
      href: "/admin/job-postings?published=false",
      icon: Briefcase,
    },
  ].filter(Boolean) as { label: string; href: string; icon: typeof Search }[];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Overview of your site&apos;s content and activity.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <QuickAction href="/admin/products/new" label="Product" />
          <QuickAction href="/admin/resources/new" label="Resource" />
          <QuickAction href="/admin/job-postings/new" label="Job Posting" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Mail}
          label="Enquiries this week"
          value={enquiriesThisWeek}
          trend={trendOf(enquiriesThisWeek, enquiriesPrevWeek)}
          href="/admin/enquiries"
        />
        <StatCard icon={Briefcase} label="Applications this week" value={applicationsThisWeek} href="/admin/job-applications" />
        <StatCard
          icon={FileText}
          label="Published resources"
          value={resourcesPublished}
          sub={resourcesDraft > 0 ? `${resourcesDraft} in draft` : undefined}
          href="/admin/resources"
        />
        <StatCard
          icon={Briefcase}
          label="Live job postings"
          value={jobPostingsLive}
          sub={jobPostingsDraft > 0 ? `${jobPostingsDraft} unpublished` : undefined}
          href="/admin/job-postings"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Enquiries</CardTitle>
              <CardDescription>Latest submissions across every form.</CardDescription>
            </div>
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin/enquiries" />}>
              View all
              <ArrowUpRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {recentEnquiries.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No enquiries yet.</p>
            )}
            {recentEnquiries.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{e.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {e.enquiryType} &middot; {e.company || e.email}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline">{SOURCE_LABEL[e.source] ?? e.source}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(e.createdAt, { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Needs Attention</CardTitle>
            <CardDescription>Content gaps worth a look.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {needsAttention.length === 0 && (
              <p className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <ShieldCheck className="size-4 text-success" />
                Everything looks good.
              </p>
            )}
            {needsAttention.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-2.5 rounded-md border border-border bg-amber-500/5 px-3 py-2.5 text-sm transition-colors hover:bg-amber-500/10"
              >
                <AlertTriangle className="size-3.5 shrink-0 text-amber-500" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
            <CardDescription>Every category by product count.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCategories.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No categories yet.</p>
            )}
            {topCategories.map((c) => {
              const max = topCategories[0]?._count.products || 1;
              const pct = Math.round((c._count.products / max) * 100);
              return (
                <div key={c.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground">{c._count.products}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Inventory</CardTitle>
            <CardDescription>Everything currently live.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <InventoryTile icon={Package} label="Products" value={productCount} href="/admin/products" />
            <InventoryTile icon={Factory} label="Industries" value={industryCount} href="/admin/industries" />
            <InventoryTile icon={Handshake} label="Partners" value={partnerCount} href="/admin/partners" />
            <InventoryTile icon={ShieldCheck} label="Certifications" value={certificationCount} href="/admin/certifications" />
            <InventoryTile icon={Globe} label="Countries" value={countryCount} href="/admin/countries" />
            <InventoryTile icon={ImageIcon} label="Media Assets" value={mediaCount} href="/admin/media" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function trendOf(current: number, previous: number): { direction: "up" | "down" | "flat"; pct: number } | undefined {
  if (previous === 0) return current > 0 ? { direction: "up", pct: 100 } : undefined;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return { direction: "flat", pct: 0 };
  return { direction: pct > 0 ? "up" : "down", pct: Math.abs(pct) };
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Button variant="outline" size="sm" nativeButton={false} render={<Link href={href} />}>
      <Plus className="size-3.5" />
      {label}
    </Button>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  sub?: string;
  trend?: { direction: "up" | "down" | "flat"; pct: number };
  href: string;
}) {
  const TrendIcon = trend?.direction === "up" ? TrendingUp : trend?.direction === "down" ? TrendingDown : Minus;
  return (
    <Link href={href} className="block">
      <Card className="transition-colors hover:bg-muted/40">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          <Icon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex items-end justify-between gap-2">
          <span className="text-2xl font-semibold">{value}</span>
          {trend && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                trend.direction === "up" && "text-success",
                trend.direction === "down" && "text-destructive",
                trend.direction === "flat" && "text-muted-foreground"
              )}
            >
              <TrendIcon className="size-3" />
              {trend.pct}%
            </span>
          )}
          {!trend && sub && <span className="text-xs text-muted-foreground">{sub}</span>}
        </CardContent>
      </Card>
    </Link>
  );
}

function InventoryTile({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1.5 rounded-lg border border-border p-3 transition-colors hover:bg-muted/40"
    >
      <Icon className="size-4 text-muted-foreground" />
      <span className="text-lg font-semibold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </Link>
  );
}
