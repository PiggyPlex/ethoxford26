import {
  FileText,
  Tag,
  CalendarDays,
  Heart,
  CheckCircle,
  TrendingUp,
  Bell,
  Sparkles,
  Globe,
  Flame,
  Shirt,
  Megaphone,
  ShoppingBag,
  MapPin,
  Percent,
} from "lucide-react"
import type { ComponentType } from "react"
import type { LucideProps } from "lucide-react"

const iconMap: Record<string, ComponentType<LucideProps>> = {
  "document-text": FileText,
  tag: Tag,
  "calendar-days": CalendarDays,
  heart: Heart,
  "check-circle": CheckCircle,
  "arrow-trending-up": TrendingUp,
  bell: Bell,
  sparkles: Sparkles,
  globe: Globe,
  flame: Flame,
  shirt: Shirt,
  megaphone: Megaphone,
  "shopping-bag": ShoppingBag,
  "map-pin": MapPin,
  percent: Percent,
}

interface NotificationIconProps {
  name: string
  className?: string
}

export function NotificationIcon({
  name,
  className = "h-4 w-4",
}: NotificationIconProps) {
  const Icon = iconMap[name] ?? Bell
  return <Icon className={className} />
}
