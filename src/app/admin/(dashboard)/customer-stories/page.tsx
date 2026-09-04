import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { CustomerStoryList } from "@/components/admin/customer-stories/customer-story-list";

const PAGE_SIZE = 20;

export default async function AdminCustomerStoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [stories, total] = await Promise.all([
    prisma.customerStory.findMany({
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.customerStory.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Customer Stories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage customer testimonials. Enable them for specific sub-industry pages from each sub-industry&apos;s edit form.
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Customer Stories" }]} />
      </div>

      <CustomerStoryList stories={stories} total={total} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
