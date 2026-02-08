import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CardActionsProps {
  actions: { label: string; variant?: "default" | "outline" | "ghost" }[]
  compact?: boolean
}

export function CardActions({ actions, compact = false }: CardActionsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", compact && "gap-1.5")}>
      {actions.map((action, i) => {
        const variant = action.variant ?? (i === 0 ? "default" : "outline")
        return (
          <Button
            key={action.label}
            variant={variant}
            size="sm"
            className={cn(
              "rounded-full text-xs font-medium",
              compact && "h-7 px-2.5 text-[11px]",
              variant === "default" && "bg-neutral-900 text-white hover:bg-neutral-800",
              variant === "outline" && "border-neutral-300 text-neutral-600 hover:bg-neutral-50",
              variant === "ghost" && "text-neutral-400 hover:text-neutral-600 hover:bg-transparent",
            )}
          >
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}
