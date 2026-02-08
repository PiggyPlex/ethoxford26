"use client"

import { useState } from "react"
import { notifications } from "@/data/mockData"
import type { Notification } from "@/data/mockData"
import { MoodboardCard } from "@/components/notifications/moodboard-card"
import { MoodboardDetailSheet } from "@/components/notifications/moodboard-detail-sheet"
import { CurrentlyRunning } from "@/components/dashboard/currently-running"
import { cn } from "@/lib/utils"

type FilterType = "all" | "discovered" | "purchased" | "deals"

// Filter tabs configuration
const FILTERS: Array<{ id: FilterType; label: string }> = [
  { id: "all", label: "All" },
  { id: "discovered", label: "Discovered" },
  { id: "purchased", label: "Purchased" },
  { id: "deals", label: "Deals" },
]

// ─── Feed View ──────────────────────────────────────────────────────────────

export function FeedView() {
  const [filter, setFilter] = useState<FilterType>("all")
  const [selected, setSelected] = useState<Notification | null>(null)

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true
    if (filter === "discovered") return n.type === "trending" || n.type === "product"
    if (filter === "purchased") return n.type === "purchased" // Would need new type in real data
    if (filter === "deals") return n.type === "deal"
    return true
  }).filter(n => n.type !== "outfit") // Hide outfit grids

  return (
    <div className="flex flex-col gap-6 px-8 animate-fade-in">
      {/* Header & Filters */}
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Explore your personalized fashion feed.
        </p>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "flex-shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-all",
                filter === f.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid layout (masonry-style like moodboard) */}
      {filteredNotifications.length > 0 ? (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
          {filteredNotifications.map((n, i) => (
            <MoodboardCard
              key={n.id}
              notification={n}
              index={i}
              isVisible={true}
              onClick={() => setSelected(n)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No items in this category yet.
          </p>
        </div>
      )}

      <CurrentlyRunning />

      {/* Detail drawer */}
      <MoodboardDetailSheet
        notification={selected}
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
