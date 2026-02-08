"use client"

import { useState } from "react"
import { TopBar } from "@/components/dashboard/top-bar"
import { FeedView } from "@/components/dashboard/feed-view"
import { KanbanView } from "@/components/dashboard/kanban-view"
import { StyleProfile } from "@/components/dashboard/style-profile"

type LayoutMode = "feed" | "kanban" | "profile"

interface DashboardProps {
  onBack?: () => void
}

export function Dashboard({ onBack }: DashboardProps) {
  const [layout, setLayout] = useState<LayoutMode>("feed")

  return (
    <div
      className="flex min-h-screen flex-col pb-24"
      style={{
        background:
          "linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 40%, #FAFAFA 100%)",
      }}
    >
      <TopBar
        layout={layout}
        onSetLayout={setLayout}
        onBack={onBack}
      />
      <div className="flex flex-col gap-4">
        {layout === "feed" && <FeedView />}
        {layout === "kanban" && <KanbanView />}
        {layout === "profile" && <StyleProfile />}
      </div>
      {/* Bottom-right corner reserved for chat icon (View 3) */}
    </div>
  )
}
