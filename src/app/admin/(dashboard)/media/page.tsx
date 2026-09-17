import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { MediaLibraryClient } from "@/components/admin/media-library-client";

const PAGE_SIZE = 24;

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; type?: string }>;
}) {
  const { page: pageParam, q, type } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.MediaAssetWhereInput = {
    ...(q ? { filename: { contains: q } } : {}),
    ...(type ? { type } : {}),
  };

  const [assets, total] = await Promise.all([
    prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.mediaAsset.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Media Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload images and videos here, then pick from them in any page section that supports a media picker (e.g. About Gallery).
          </p>
        </div>
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Media Library" }]} />
      </div>

      <MediaLibraryClient
        initialAssets={assets.map((a) => ({
          id: a.id,
          url: a.url,
          type: a.type as "image" | "video",
          filename: a.filename,
          alt: a.alt,
          createdAt: a.createdAt.toISOString(),
        }))}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        q={q ?? ""}
        type={type ?? ""}
      />
    </div>
  );
}
