export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      {/* Skeleton header */}
      <div className="flex items-center justify-between">
        <div className="theme-skeleton h-7 w-40 animate-pulse rounded-md" />
        <div className="theme-skeleton h-9 w-36 animate-pulse rounded-md" />
      </div>
      {/* Skeleton filter bar */}
      <div className="flex gap-3">
        <div className="theme-skeleton h-9 flex-1 animate-pulse rounded-md" />
        <div className="theme-skeleton h-9 w-40 animate-pulse rounded-md" />
        <div className="theme-skeleton h-9 w-32 animate-pulse rounded-md" />
      </div>
      {/* Skeleton rows */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="theme-skeleton h-12 w-full animate-pulse rounded-md" />
      ))}
    </div>
  );
}
