import { cn } from "@/lib/utils"
import { NotificationIcon } from "@/components/notifications/notification-icon"

export type CardCategory =
  | "Product"
  | "Trending"
  | "Deal"
  | "Drop"
  | "Outfit"
  | "Sponsored"

const categoryIcons: Record<CardCategory, string> = {
  Product: "sparkles",
  Trending: "arrow-trending-up",
  Deal: "tag",
  Drop: "flame",
  Outfit: "shirt",
  Sponsored: "megaphone",
}

interface CategoryBadgeProps {
  category: CardCategory
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        "bg-neutral-100 text-neutral-600",
        className
      )}
    >
      <NotificationIcon name={categoryIcons[category]} className="h-3.5 w-3.5" />
      {category}
    </span>
  )
}
