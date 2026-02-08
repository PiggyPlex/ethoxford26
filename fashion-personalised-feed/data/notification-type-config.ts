// ─── Notification Type Config ─────────────────────────────────────────────────
// Single source of truth for all notification type styling and metadata.
// Adding a new type means adding ONE entry here.
//
// Minimalist palette: all types share neutral grayscale — differentiation is
// via icon shape and label text, not color.

export interface NotificationTypeConfig {
  /** Human-readable label shown in tags/badges */
  label: string
  /** Default lucide icon name */
  iconName: string
  /** Tailwind classes for the tinted icon background */
  iconBg: string
  /** Tailwind class for the tag text color */
  tagColor: string
  /** Tailwind classes for the badge pill style */
  badgeStyle: string
  /** Tailwind class for the tile border (briefing sidebar) */
  tileBorder: string
  /** Generates a headline from a count */
  headline: (count: number) => string
}

// Shared neutral palette — one style, all types
const NEUTRAL = {
  iconBg: "bg-neutral-100 text-neutral-500",
  tagColor: "text-neutral-500",
  badgeStyle: "bg-neutral-100 text-neutral-600",
  tileBorder: "border-neutral-200/60",
}

const MUTED = {
  iconBg: "bg-neutral-50 text-neutral-400",
  tagColor: "text-neutral-400",
  badgeStyle: "bg-neutral-50 text-neutral-500",
  tileBorder: "border-neutral-100/60",
}

export const NOTIFICATION_TYPE_CONFIG: Record<string, NotificationTypeConfig> = {
  product: {
    label: "For You",
    iconName: "sparkles",
    ...NEUTRAL,
    headline: (n) => `${n} item${n !== 1 ? "s" : ""} picked for you`,
  },
  trending: {
    label: "Trending",
    iconName: "arrow-trending-up",
    ...NEUTRAL,
    headline: (n) => `${n} item${n !== 1 ? "s" : ""} trending near you`,
  },
  deal: {
    label: "Deal",
    iconName: "tag",
    ...NEUTRAL,
    headline: (n) => `${n} deal${n !== 1 ? "s" : ""} found`,
  },
  drop: {
    label: "New Drop",
    iconName: "flame",
    ...NEUTRAL,
    headline: (n) => `${n} new drop${n !== 1 ? "s" : ""}`,
  },
  outfit: {
    label: "Outfit",
    iconName: "shirt",
    ...NEUTRAL,
    headline: (n) => `${n} outfit${n !== 1 ? "s" : ""} assembled`,
  },
  sponsored: {
    label: "Sponsored",
    iconName: "megaphone",
    ...MUTED,
    headline: (n) => `${n} sponsored item${n !== 1 ? "s" : ""}`,
  },
}

/** Fallback for unknown/new types — system never crashes on an unregistered type */
export const DEFAULT_TYPE_CONFIG: NotificationTypeConfig = {
  label: "Update",
  iconName: "bell",
  ...NEUTRAL,
  headline: (n) => `${n} update${n !== 1 ? "s" : ""}`,
}

/** Safe accessor — returns the config for a type or the fallback */
export function getTypeConfig(type: string): NotificationTypeConfig {
  return NOTIFICATION_TYPE_CONFIG[type] ?? DEFAULT_TYPE_CONFIG
}
