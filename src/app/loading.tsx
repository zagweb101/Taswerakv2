// Root loading skeleton — shown during route transitions.
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl skeleton-shimmer" />
          <div className="space-y-1.5 flex-1">
            <div className="h-5 w-1/3 skeleton-shimmer rounded-lg" />
            <div className="h-3 w-1/4 skeleton-shimmer rounded-lg" />
          </div>
        </div>

        {/* Card grid skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/40 p-4 bg-card">
              <div className="h-9 w-9 rounded-xl skeleton-shimmer mb-3" />
              <div className="h-7 w-1/2 skeleton-shimmer rounded-lg mb-2" />
              <div className="h-3 w-2/3 skeleton-shimmer rounded-lg" />
            </div>
          ))}
        </div>

        {/* List skeleton */}
        <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
              <div className="h-10 w-10 rounded-lg skeleton-shimmer shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-1/3 skeleton-shimmer rounded-lg" />
                <div className="h-3 w-1/4 skeleton-shimmer rounded-lg" />
              </div>
              <div className="h-6 w-16 skeleton-shimmer rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
