export function SkeletonCard() {
  return (
    <div
      className="bg-white border rounded-lg overflow-hidden"
      style={{ border: '1px solid var(--border)' }}
      aria-hidden="true"
    >
      {/* OG image placeholder */}
      <div className="skeleton" style={{ aspectRatio: '16/9', width: '100%' }} />
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
    </div>
  )
}
