import type { Notification } from "@/data/mockData"
import { getTypeConfig } from "@/data/notification-type-config"

export interface CategorySummaryItem {
  type: string
  iconName: string
  count: number
  label: string
  headline: string
}

/**
 * Derives the "At a glance" summary from the actual notifications array.
 * Groups by type, counts, and generates labels/headlines from the config.
 * Always in sync with whatever notifications exist — no stale data.
 *
 * For outfit-type notifications, counts inner `details.outfitItems` length
 * instead of notification count, so the headline accurately reflects
 * the number of items in the assembled outfit.
 */
export function deriveCategorySummary(
  items: Notification[]
): CategorySummaryItem[] {
  const groupMap = new Map<string, Notification[]>()

  for (const n of items) {
    const arr = groupMap.get(n.type) ?? []
    arr.push(n)
    groupMap.set(n.type, arr)
  }

  return Array.from(groupMap.entries()).map(([type, group]) => {
    const config = getTypeConfig(type)

    // For outfit type, count inner outfitItems for accurate headlines
    let headlineCount = group.length
    if (type === "outfit") {
      const innerCount = group.reduce(
        (sum, n) => sum + (n.details?.outfitItems?.length ?? 0),
        0
      )
      if (innerCount > 0) headlineCount = innerCount
    }

    return {
      type,
      iconName: config.iconName,
      count: headlineCount,
      label: config.label,
      headline: config.headline(headlineCount),
    }
  })
}

/**
 * Enforces a maximum ratio of 1 sponsored notification per 5 organic items.
 * Removes excess sponsored items from the end of the array.
 */
export function enforceSponsored(items: Notification[]): Notification[] {
  const organic = items.filter((n) => n.type !== "sponsored")
  const sponsored = items.filter((n) => n.type === "sponsored")

  const maxSponsored = Math.max(1, Math.floor(organic.length / 5))
  const keptSponsored = sponsored.slice(0, maxSponsored)

  // Interleave: place sponsored items after every 5 organic
  const result: Notification[] = []
  let sponsoredIdx = 0

  for (let i = 0; i < organic.length; i++) {
    result.push(organic[i])
    if ((i + 1) % 5 === 0 && sponsoredIdx < keptSponsored.length) {
      result.push(keptSponsored[sponsoredIdx])
      sponsoredIdx++
    }
  }

  // Append any remaining sponsored (if fewer than 5 organic total)
  while (sponsoredIdx < keptSponsored.length) {
    result.push(keptSponsored[sponsoredIdx])
    sponsoredIdx++
  }

  return result
}
