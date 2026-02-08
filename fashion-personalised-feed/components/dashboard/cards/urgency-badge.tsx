import { cn } from "@/lib/utils"

interface UrgencyBadgeProps {
  /** Text like "Ends in 2 hours" or "Only 3 left" */
  text: string
  /** Show shimmer animation */
  shimmer?: boolean
  className?: string
}

export function UrgencyBadge({
  text,
  shimmer = false,
  className,
}: UrgencyBadgeProps) {
  return (
    <p
      className={cn(
        "text-[11px] font-medium text-neutral-500",
        shimmer && "animate-urgency-shimmer",
        className
      )}
    >
      {text}
    </p>
  )
}
