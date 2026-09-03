function Skel({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-stone-200 ${className}`} />;
}

export default function ProductDetailLoading() {
  return (
    <div className="container flex flex-col gap-16 pt-32 lg:pt-36 pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-3">
        <Skel className="h-4 w-16" />
        <Skel className="h-4 w-4" />
        <Skel className="h-4 w-24" />
        <Skel className="h-4 w-4" />
        <Skel className="h-4 w-32" />
      </nav>

      {/* Hero: info + gallery */}
      <div className="flex justify-between items-start gap-10 flex-wrap lg:flex-nowrap">
        <div className="w-full lg:max-w-144 flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Skel className="h-6 w-28" />
              <div className="flex flex-col gap-3 mt-1">
                <div className="flex items-center gap-2.5">
                  <Skel className="h-4 w-16" />
                  <Skel className="h-4 w-24" />
                  <Skel className="h-4 w-36" />
                </div>
                <Skel className="h-10 w-3/4" />
              </div>
              <Skel className="h-4 w-full" />
              <Skel className="h-4 w-5/6" />
            </div>

            <div className="flex flex-col gap-3">
              <Skel className="h-3 w-32" />
              <Skel className="h-5 w-2/3" />
            </div>

            <div className="flex flex-col gap-3">
              <Skel className="h-3 w-24" />
              <div className="flex flex-wrap gap-2.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skel key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>
            </div>
          </div>

          <Skel className="h-12 w-60 rounded-full" />
        </div>

        <div className="w-full aspect-[630/530] max-w-158 rounded-3xl bg-neutral-100 animate-pulse" />
      </div>

      {/* Variant configurator + tabs */}
      <div className="flex flex-col gap-7">
        <Skel className="h-9 w-96" />
        <div className="flex justify-between items-start gap-10 flex-wrap lg:flex-nowrap">
          <div className="w-full lg:max-w-120 flex flex-col gap-5">
            <Skel className="h-12 w-full" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skel className="h-3 w-24" />
                <div className="flex flex-wrap gap-3">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skel key={j} className="h-8 w-16 rounded-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="w-full lg:max-w-170 flex flex-col gap-4">
            <Skel className="h-10 w-full" />
            <Skel className="h-40 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
