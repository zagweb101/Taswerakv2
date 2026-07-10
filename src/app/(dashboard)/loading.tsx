// Dashboard loading skeleton — shown when navigating between dashboard pages.
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 skeleton-shimmer rounded-lg" />
          <div className="h-4 w-72 skeleton-shimmer rounded-lg" />
        </div>
        <div className="h-10 w-32 skeleton-shimmer rounded-xl" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/40 p-4 bg-card">
            <div className="h-9 w-9 rounded-xl skeleton-shimmer mb-3" />
            <div className="h-7 w-1/2 skeleton-shimmer rounded-lg mb-2" />
            <div className="h-3 w-2/3 skeleton-shimmer rounded-lg" />
          </div>
        ))}
      </div>

      {/* Cards list */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-card p-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl skeleton-shimmer shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 skeleton-shimmer rounded-lg" />
                <div className="h-3 w-1/2 skeleton-shimmer rounded-lg" />
                <div className="h-3 w-1/4 skeleton-shimmer rounded-lg" />
              </div>
              <div className="h-6 w-20 skeleton-shimmer rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
