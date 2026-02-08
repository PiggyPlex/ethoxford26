import { quickActions } from "@/data/mockData"

interface QuickActionsProps {
  onAction: (text: string) => void
}

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-none"
      role="toolbar"
      aria-label="Quick actions"
    >
      {quickActions.map((action) => (
        <button
          key={action}
          onClick={() => onAction(action)}
          className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary hover:text-primary"
        >
          {action}
        </button>
      ))}
    </div>
  )
}
