import { Skeleton } from "@/components/ui/skeleton"

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <Skeleton className="h-7 w-20 rounded-full" />
      <Skeleton className="mt-4 h-5 w-3/4 rounded-lg" />
      <Skeleton className="mt-2 h-4 w-1/2 rounded-lg" />
      <Skeleton className="mt-4 h-24 w-full rounded-2xl" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
    </div>
  )
}
