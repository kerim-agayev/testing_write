export function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-[var(--surface-panel)] rounded animate-pulse ${className ?? ''}`} />;
}

export function SkeletonCard() {
  return (
    <div className="p-4 border border-[var(--border-color)] rounded-lg space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>
      <Skeleton className="h-2.5 w-full" />
      <Skeleton className="h-2.5 w-3/4" />
    </div>
  );
}

export function SkeletonMentorCard() {
  return (
    <div className="p-4 border border-[var(--border-color)] rounded-lg">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-3.5 w-28 mb-1.5" />
          <Skeleton className="h-2.5 w-20" />
        </div>
        <Skeleton className="w-16 h-7 rounded-md" />
      </div>
      <Skeleton className="h-2.5 w-full mb-1.5" />
      <Skeleton className="h-2.5 w-2/3" />
    </div>
  );
}
