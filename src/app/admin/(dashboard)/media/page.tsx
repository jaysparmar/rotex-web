import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { MediaLibraryClient } from "@/components/admin/media-library-client";

export default async function AdminMediaPage() {
  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });

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
      />
    </div>
  );
}
