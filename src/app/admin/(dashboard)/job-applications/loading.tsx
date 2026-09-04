import { Skeleton, SkeletonTableRows } from "@/components/ui/skeleton";

export default function JobApplicationsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-6 w-48" />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <tbody>
            <SkeletonTableRows rows={10} cols={11} />
          </tbody>
        </table>
      </div>
    </div>
  );
}
