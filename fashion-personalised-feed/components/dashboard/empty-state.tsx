import { Sparkles } from "lucide-react"

interface EmptyStateProps {
  title?: string
  description?: string
}

export function EmptyState({
  title = "Nothing here yet",
  description = "FriendOS is working in the background. New results will appear here automatically.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
        <Sparkles className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
