export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      {/* Skeleton header */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 rounded-md bg-zinc-700 animate-pulse" />
        <div className="h-9 w-36 rounded-md bg-zinc-700 animate-pulse" />
      </div>
      {/* Skeleton filter bar */}
      <div className="flex gap-3">
        <div className="h-9 flex-1 rounded-md bg-zinc-700 animate-pulse" />
        <div className="h-9 w-40 rounded-md bg-zinc-700 animate-pulse" />
        <div className="h-9 w-32 rounded-md bg-zinc-700 animate-pulse" />
      </div>
      {/* Skeleton rows */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 w-full rounded-md bg-zinc-700 animate-pulse" />
      ))}
    </div>
  );
}
