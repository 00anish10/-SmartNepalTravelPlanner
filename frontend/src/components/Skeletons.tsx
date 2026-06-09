export function CardSkeleton() {
  return (
    <div className="card-gradient rounded-xl p-5 border border-white/5 animate-pulse">
      <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
      <div className="h-3 bg-white/10 rounded w-1/2 mb-3" />
      <div className="h-3 bg-white/10 rounded w-full mb-2" />
      <div className="h-3 bg-white/10 rounded w-2/3 mb-4" />
      <div className="flex gap-2">
        <div className="h-5 bg-white/10 rounded-full w-16" />
        <div className="h-5 bg-white/10 rounded-full w-16" />
        <div className="h-5 bg-white/10 rounded-full w-16" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-white/5">
          <div className="h-4 bg-white/10 rounded w-12" />
          <div className="h-4 bg-white/10 rounded w-32" />
          <div className="h-4 bg-white/10 rounded w-40 flex-1" />
          <div className="h-4 bg-white/10 rounded w-20" />
          <div className="h-4 bg-white/10 rounded w-16" />
        </div>
      ))}
    </div>
  )
}

export function DetailPanelSkeleton() {
  return (
    <div className="card-gradient rounded-xl p-6 border border-white/10 animate-pulse">
      <div className="h-6 bg-white/10 rounded w-2/3 mb-6" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex justify-between mb-3">
          <div className="h-4 bg-white/10 rounded w-20" />
          <div className="h-4 bg-white/10 rounded w-28" />
        </div>
      ))}
      <div className="h-10 bg-white/10 rounded-xl mt-6" />
      <div className="h-10 bg-white/10 rounded-xl mt-2" />
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="animate-pulse mb-10">
          <div className="h-10 bg-white/10 rounded w-1/2 mb-2" />
          <div className="h-4 bg-white/10 rounded w-1/3" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card-gradient rounded-xl p-5 border border-white/5 animate-pulse mb-4">
            <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
            <div className="h-3 bg-white/10 rounded w-1/2 mb-3" />
            <div className="h-3 bg-white/10 rounded w-full mb-2" />
            <div className="flex gap-2">
              <div className="h-5 bg-white/10 rounded-full w-16" />
              <div className="h-5 bg-white/10 rounded-full w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
