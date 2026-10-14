export function RepoCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 animate-pulse space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-slate-800" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-1/3 bg-slate-800 rounded" />
            <div className="h-3 w-1/4 bg-slate-800/60 rounded" />
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-slate-800" />
      </div>

      <div className="space-y-2">
        <div className="h-3.5 w-full bg-slate-800 rounded" />
        <div className="h-3.5 w-4/5 bg-slate-800/70 rounded" />
      </div>

      <div className="flex items-center gap-4 pt-2 border-t border-slate-800/60">
        <div className="h-3 w-16 bg-slate-800 rounded" />
        <div className="h-3 w-14 bg-slate-800 rounded" />
        <div className="h-3 w-14 bg-slate-800 rounded" />
      </div>
    </div>
  );
}

export function RepoDetailSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-1/3 bg-slate-800 rounded" />
            <div className="h-4 w-1/2 bg-slate-800/60 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-800/50 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Two columns skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <div className="h-5 w-1/3 bg-slate-800 rounded" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-800/40 rounded-xl" />
          ))}
        </div>
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <div className="h-5 w-1/3 bg-slate-800 rounded" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-800/40 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
