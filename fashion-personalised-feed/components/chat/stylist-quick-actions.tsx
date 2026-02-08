"use client"

import { useProfile } from "@/lib/profile-context"

interface StylistQuickActionsProps {
  onAction: (text: string) => void
}

export function StylistQuickActions({ onAction }: StylistQuickActionsProps) {
  const { profile } = useProfile()

  // Build profile-aware quick actions
  const topBrand = profile?.favouriteBrands?.[0]?.name
  const actions: string[] = [
    "Build me a weekend outfit",
    topBrand ? `What's new from ${topBrand}?` : "Recommend me a brand",
    "Outfit for a date night",
    "Explore new styles",
    "Weekly style report",
  ]

  return (
    <div
      className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-none"
      role="toolbar"
      aria-label="Stylist suggestions"
    >
      {actions.map((action) => (
        <button
          key={action}
          onClick={() => onAction(action)}
          className="shrink-0 rounded-full border border-neutral-200 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-700"
        >
          {action}
        </button>
      ))}
    </div>
  )
}
